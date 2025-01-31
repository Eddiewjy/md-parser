import os


def rename_files_in_directory(directory, old_extension, new_extension):
    # 获取目录下的所有文件
    files = os.listdir(directory)

    # 遍历文件
    for file in files:
        # 判断文件是否有指定的后缀
        if file.endswith(old_extension):
            # 获取文件的完整路径
            old_file = os.path.join(directory, file)
            # 创建新的文件名
            new_file = os.path.join(
                directory, file.replace(old_extension, new_extension)
            )

            # 重命名文件
            os.rename(old_file, new_file)
            print(f"Renamed: {old_file} -> {new_file}")


# 示例：批量将目录中的所有 `.txt` 文件修改为 `.md` 文件
directory_path = "D:/GitHub_Project/md-parser/src/rules/inline"  # 替换为你的目录路径
old_ext = ".mjs"  # 替换为你想修改的旧后缀名
new_ext = ".ts"  # 替换为你想要的新后缀名

rename_files_in_directory(directory_path, old_ext, new_ext)
