console.log("profileHandleers.js loaded");

document.getElementById('profilePhoto').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function() {
    this.form.submit(); // Auto-submit the form when a file is selected
});