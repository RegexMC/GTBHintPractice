# Original by Ginozeel, Modified by https://github.com/sophiethefox/

import os
import gzip
import csv
import tkinter as tk
from tkinter import messagebox


def findminecraft():
    home_dir = os.path.expanduser('~')
    minecraft_path = os.path.join(home_dir, 'AppData', 'Roaming', ".minecraft", "logs")
    if os.path.exists(minecraft_path):
        return minecraft_path
    else:
        return None


def search_logs():
    log_folder_path = log_path_txt.get()
    output_path = output_path_txt.get()

    if not log_folder_path or not output_path:
        messagebox.showwarning("Warning", "Please enter values in both text boxes.")
        return

    themes = {}

    for log_file_name in os.listdir(log_folder_path):
        log_file_path = os.path.join(log_folder_path, log_file_name)
        
        if not log_file_path.endswith(".gz"):
            continue

        with gzip.open(log_file_path, 'rt') as gzip_file:
            for line in gzip_file:
                if "The theme was: " in line:
                    theme = line.split("The theme was: ")[1].strip().replace("!", "")
                    if theme in themes:
                        themes[theme] += 1
                    else:
                        themes[theme] = 1


    sorted_data = {k: v for k, v in sorted(themes.items(), key=lambda item: item[1], reverse=True)}

    with open(output_path, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Theme", "Frequency"])
        
        for theme, frequency in sorted_data.items():
            writer.writerow([theme, frequency])

    messagebox.showinfo("Complete", "Finished searching logs! All themes found saved to " + output_path)



minecraft_path = findminecraft()

# Create the main application window
root = tk.Tk()
root.title("GTB Log Analyser")

log_path_lbl = tk.Label(root, text="Logs Path (.minecraft/logs/): ")
output_path_lbl = tk.Label(root, text="Output file: ")

# Create the text boxes
log_path_txt = tk.Entry(root)
output_path_txt = tk.Entry(root)

if minecraft_path:
    log_path_txt.insert(1, minecraft_path)
output_path_txt.insert(0, "output.csv")

log_path_txt.focus_set()

# Create the button
button = tk.Button(root, text="Search Logs", command=search_logs)

# Arrange the widgets on the window using the grid layout manager
log_path_lbl.grid(row=0, column=0, padx=10, pady=5, sticky="e")
log_path_txt.grid(row=0, column=1, padx=10, pady=5)
output_path_lbl.grid(row=1, column=0, padx=10, pady=5, sticky="e")
output_path_txt.grid(row=1, column=1, padx=10, pady=5)
button.grid(row=2, column=0, columnspan=2, padx=10, pady=5)

# Start the Tkinter event loop

root.mainloop()
