const chatBody = document.getElementById('chatBody');
const chatInput = document.getElementById('chatInput');
const typingIndicator = document.getElementById('typingIndicator');
const quickReplies = document.getElementById('quickReplies');



function handleEnter(e) {
    if (e.key === 'Enter') {
        sendManualMsg();
    }
}

function sendManualMsg() {
    const text = chatInput.value.trim();
    if (text) {
        sendMsg(text);
        chatInput.value = '';
    }
}

function sendMsg(text) {
    // Add User Message
    appendMessage('user', text);
    
    // Hide quick replies after first use to clean up UI
    quickReplies.style.display = 'none';

    // Show typing indicator
    chatBody.appendChild(typingIndicator);
    typingIndicator.style.display = 'flex';
    scrollToBottom();

    // Process AI Response with a small delay
    // Call Real AI Backend
    fetch('/api/v1/ai/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: text })
    })
    .then(res => res.json())
    .then(data => {
        typingIndicator.style.display = 'none';
        if (data.success) {
            // Replace newlines with <br> for HTML rendering if needed
            let formattedReply = data.reply.replace(/\n/g, '<br>');
            // Sometimes Gemini formats with markdown bold (**text**). 
            // Optional: Simple replace for basic markdown to HTML bold
            formattedReply = formattedReply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            appendMessage('ai', formattedReply);
        } else {
            appendMessage('ai', 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না। ' + (data.message || ''));
        }
    })
    .catch(err => {
        console.error("AI API Error:", err);
        typingIndicator.style.display = 'none';
        appendMessage('ai', 'দুঃখিত, সার্ভারের সাথে সংযোগ করা যাচ্ছে না। দয়া করে আপনার ইন্টারনেট এবং সার্ভার চেক করুন।');
    });
}

function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerHTML = text;
    chatBody.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
}

function clearChat() {
    if(confirm("আপনি কি চ্যাট হিস্ট্রি মুছে ফেলতে চান?")) {
        chatBody.innerHTML = `
            <div class="message ai">
                হ্যালো! আমি আপনার AI Health Assistant। আপনার যেকোনো রোগ, লক্ষণ বা স্বাস্থ্য বিষয়ক প্রশ্ন আমাকে করতে পারেন। আমি দ্রুত উত্তর দেওয়ার চেষ্টা করব। 
                <br><br>
                <strong>সতর্কতা:</strong> আমি কোনো আসল ডাক্তার নই। এটি শুধুমাত্র সাধারণ তথ্যের জন্য।
            </div>`;
        quickReplies.style.display = 'flex';
    }
}
