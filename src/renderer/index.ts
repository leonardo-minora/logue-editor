document.addEventListener("DOMContentLoaded", () => {
	const editor = document.getElementById("editor") as HTMLTextAreaElement;

	if (!editor) {
		return;
	}

	editor.addEventListener("keydown", (event: KeyboardEvent) => {
		if (event.key === "Tab") {
			event.preventDefault();
			const start = editor.selectionStart;
			const end = editor.selectionEnd;
			editor.value = `${editor.value.substring(0, start)}\t${editor.value.substring(end)}`;
			editor.selectionStart = start + 1;
			editor.selectionEnd = start + 1;
		}
	});
});
