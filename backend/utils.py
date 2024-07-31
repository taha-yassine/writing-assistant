import difflib

def diff_json(original, corrected):
    """
    Compare a text and its corrected version and return a list of JSON objects representing word-level changes.

    Each JSON object in the list has the format {"old": "original text", "new": "corrected text"}. Only differences are included in the output.

    Args:
        original (str): The original text string.
        corrected (str): The corrected text string.

    Returns:
        list: A list of dictionaries representing word-level changes between the input strings.
    """
    differ = difflib.SequenceMatcher(None, original.split(), corrected.split())
    changes = []
    
    for tag, i1, i2, j1, j2 in differ.get_opcodes():
        if tag in ('replace', 'delete', 'insert'):
            old = ' '.join(original.split()[i1:i2])
            new = ' '.join(corrected.split()[j1:j2])
            if old != new:
                changes.append({"old": old, "new": new})
    
    return changes

def diff_tags(original, corrected):
    """
    Compare a text and its corrected version and return the original text with tags surrounding the changes.

    Args:
        original (str): The original text string.
        corrected (str): The corrected text string.

    Returns:
        results (str): The original text with tags surrounding the changes.
    """
    differ = difflib.SequenceMatcher(None, original.split(), corrected.split())
    result = []
    for tag, i1, i2, j1, j2 in differ.get_opcodes():
        if tag == 'equal':
            result.extend(original.split()[i1:i2])
        elif tag in ('replace', 'delete', 'insert'):
            old = ' '.join(original.split()[i1:i2])
            new = ' '.join(corrected.split()[j1:j2])
            new = new.replace('"', '&quot;') # Escape double quotes
            result.append(f'<suggestion data="{new}">{old}</suggestion>')
    
    return ' '.join(result)