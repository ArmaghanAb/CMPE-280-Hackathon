function toggleChat() {
    const modal = document.getElementById('chatModal');
    modal.classList.toggle('show-modal');
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        askQuestion();
    }
}

async function askQuestion() {
    const inputElement = document.getElementById("user-input");
    const question = inputElement.value.trim();
    if (question === "") return;

    const chatBox = document.getElementById("chat-box");
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.textContent = question;
    chatBox.appendChild(userBubble);

    inputElement.value = "";

    const botBubble = document.createElement("div");
    botBubble.className = "chat-bubble bot-bubble";
    botBubble.textContent = "Thinking...."; 
    chatBox.appendChild(botBubble);

    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("http://127.0.0.1:8000/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            if(botBubble.textContent === "Thinking...."){
                botBubble.textContent = '';
            }
            botBubble.textContent += chunk;
            
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    } catch (error) {
        console.error("Error fetching response:", error);
        botBubble.textContent = "An error occurred. Please try again.";
    }

    chatBox.scrollTop = chatBox.scrollHeight;
}