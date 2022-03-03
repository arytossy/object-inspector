// event handler
function collapse(event) {
    event.currentTarget.parentElement.classList.toggle("collapse");
}

function showRenameDialog(targetId) {
    const dialogWrapper = document.getElementById("dialogWrapper");
    dialogWrapper.classList.add("show");
    const targetIdHolder = document.getElementById("targetId");
    targetIdHolder.value = targetId;
}

function closeRenameDialog() {
    const dialogWrapper = document.getElementById("dialogWrapper");
    dialogWrapper.classList.remove("show");
}

function executeRename() {
    const newName = document.getElementById("newName").value;
    const targetId = document.getElementById("targetId").value;
    if (newName === "") {
        alert("New Name is required!");
        return;
    }
    if (targetId === "") {
        alert("Error occurred! Target Id is empty...");
    }
    const req = new XMLHttpRequest();
    req.open("PUT", `/logs/${targetId}/rename`);
    req.setRequestHeader("Content-Type", "application/json")
    req.send(JSON.stringify({ name: newName }));
    req.onload = () => location.reload();
}

function deleteLog(id) {
    if (!confirm(`Really? Going delete ... : "${id}"`)) return;
    const req = new XMLHttpRequest();
    req.open("DELETE", `/logs/${id}`);
    req.send();
    req.onload = () => location.reload();
}