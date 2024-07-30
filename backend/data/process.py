#%%
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
from multiprocessing import Pool, cpu_count
import itertools
import sqlite3
from utils import diff_tags

def process_line(line):
    data = json.loads(line)
    origin = data['src'].split(':', 1)[-1].strip()
    corrected = data['tgt']

    result = {
        "task": data['task'],
        "text": diff_tags(origin, corrected)
    }
    return result

def process_chunk(chunk):
    return [process_line(line) for line in chunk]

def process_jsonl(file_path, db_path, split=None, chunk_size=1000):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS dataset (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        split TEXT,
        task TEXT,
        text TEXT
    )
    ''')

    with open(file_path, 'r') as file:
        with Pool(processes=cpu_count()) as pool:
            chunk_generator = iter(lambda: list(itertools.islice(file, chunk_size)), [])
            for chunk in chunk_generator:
                processed_data = pool.apply(process_chunk, (chunk,))
                cursor.executemany(f'''
                INSERT INTO dataset (split, task, text)
                VALUES ('{split}', :task, :text)
                ''', processed_data)
                conn.commit()

    conn.close()

#%%
if __name__ == "__main__":
    train_file_path = "./datasets/coedit/train.jsonl"
    eval_file_path = "./datasets/coedit/eval.jsonl"
    db_path = "./coedit.db"
    
    process_jsonl(train_file_path, db_path, split="train")
    process_jsonl(eval_file_path, db_path, split="eval")
