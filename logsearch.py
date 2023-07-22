import os
import gzip

def search_string_in_files(folder_path, search_string):
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".gz"):
            file_path = os.path.join(folder_path, file_name)
            with gzip.open(file_path, 'rt') as gzip_file:
                for line in gzip_file:
                    if search_string in line.lower():
                        print(f"Found '{search_string}' in file: {file_path}")
                        break

# .minecraft/logs directory
folder_path = ""

theme = input("Theme: ")
search_string = ("The theme was: " + theme + "!").lower()
print("Searching for: " + search_string + " in " + folder_path)
search_string_in_files(folder_path, search_string)

# Run file in command line, py logsearch.py, then follow prompts
# Only tested on Windows 10.