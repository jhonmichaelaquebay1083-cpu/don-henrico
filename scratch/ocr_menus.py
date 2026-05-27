import os
import glob
from PIL import Image
import winocr

menu_dir = r"C:\Users\jhonm\Downloads\menus"
files = glob.glob(os.path.join(menu_dir, "*.jpg"))

output_file = r"d:\Don Henrico\scratch\ocr_results_utf8.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for file_path in files:
        f.write("========================================\n")
        f.write(f"FILE: {os.path.basename(file_path)}\n")
        f.write("========================================\n")
        try:
            img = Image.open(file_path)
            result = winocr.recognize_pil_sync(img)
            f.write(result['text'] + "\n\n")
        except Exception as e:
            f.write(f"ERROR: {str(e)}\n\n")
