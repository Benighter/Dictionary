import requests
import tkinter as tk
from tkinter import messagebox

def get_word_definition():
    # Get the selected dictionary type and word
    dictionary_type = dictionary_type_var.get()
    word = word_entry.get()

    # Select the appropriate API key and URL based on the dictionary type
    if dictionary_type == "Intermediate":
        api_key = "ff37ed69-8cd7-4154-84f0-4311555586c5"
        url = f"https://dictionaryapi.com/api/v3/references/sd3/json/{word}?key={api_key}"
    else:
        messagebox.showerror("Error", "Invalid dictionary type.")
        return

    try:
        # Perform API request to retrieve word definition
        response = requests.get(url)

        # Process the API response and display the definition
        if response.status_code == 200:
            data = response.json()

            if isinstance(data, list):
                if data:
                    definition_text.delete("1.0", tk.END)
                    for index, entry in enumerate(data, start=1):
                        definition = entry.get("shortdef", [])
                        part_of_speech = entry.get("fl", "")
                        example_sentences = entry.get("ex", [])
                        definition_text.insert(tk.END, f"{index}. [{part_of_speech}] {', '.join(definition)}\n")
                        definition_text.insert(tk.END, "Example sentences:\n")
                        for sentence in example_sentences:
                            definition_text.insert(tk.END, f"- {sentence['text']}\n")

                        synonyms_data = entry.get("meta", {}).get("syns", [])
                        if synonyms_data:
                            definition_text.insert(tk.END, "Synonyms:\n")
                            for synonym_group in synonyms_data:
                                definition_text.insert(tk.END, f"- {', '.join(synonym_group)}\n")

                        antonyms_data = entry.get("meta", {}).get("ants", [])
                        if antonyms_data:
                            definition_text.insert(tk.END, "Antonyms:\n")
                            for antonym_group in antonyms_data:
                                definition_text.insert(tk.END, f"- {', '.join(antonym_group)}\n")

                        definition_text.insert(tk.END, "\n")
                else:
                    definition_text.delete("1.0", tk.END)
                    definition_text.insert(tk.END, "No definition found.")
            else:
                definition_text.delete("1.0", tk.END)
                definition_text.insert(tk.END, "Invalid response from the API.")
        else:
            definition_text.delete("1.0", tk.END)
            definition_text.insert(tk.END, f"Error retrieving definition. Status Code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        definition_text.delete("1.0", tk.END)
        definition_text.insert(tk.END, f"An error occurred: {str(e)}")

# Create a GUI window
window = tk.Tk()
window.title("Dictionary App")

# Create dictionary type selection
dictionary_type_var = tk.StringVar(window)
dictionary_type_label = tk.Label(window, text="Dictionary Type:")
dictionary_type_label.pack()
dictionary_type_options = ["Intermediate"]
dictionary_type_var.set(dictionary_type_options[0])  # Set the default option
dictionary_type_menu = tk.OptionMenu(window, dictionary_type_var, *dictionary_type_options)
dictionary_type_menu.pack()

# Create word entry field
word_label = tk.Label(window, text="Word:")
word_label.pack()
word_entry = tk.Entry(window)
word_entry.pack()

# Create definition display area
definition_text = tk.Text(window, height=10, width=50)
definition_text.pack()

# Create search button
search_button = tk.Button(window, text="Search", command=get_word_definition)
search_button.pack()

# Start the GUI event loop
window.mainloop()
