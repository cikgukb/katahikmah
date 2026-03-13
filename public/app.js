document.addEventListener('DOMContentLoaded', () => {
    let currentQuoteType = 'hikmah'; // default
    const form = document.getElementById('videoForm');
    const submitBtn = document.getElementById('submitBtn');
    const statusContainer = document.getElementById('statusContainer');
    const videoContainer = document.getElementById('videoContainer');
    const resultVideo = document.getElementById('resultVideo');
    const downloadBtn = document.getElementById('downloadBtn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get Values
        const text = document.getElementById('motivationText').value;
        const voice = document.getElementById('voiceSelect').value;

        // UI State: Loading
        setLoadingState(true);

        try {
            // Initiate Render
            const res = await fetch('/api/render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voice, type: currentQuoteType })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Gagal untuk mula menjana video');
            }

            const projectId = data.project;
            pollStatus(projectId);

        } catch (error) {
            console.error(error);
            showErrorState(error.message);
            setLoadingState(false);
        }
    });

    async function pollStatus(projectId) {
        try {
            const res = await fetch(`/api/status/${projectId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error('Gagal memeriksa status video');
            }

            const movieStatus = data.movie.status;

            if (movieStatus === 'done') {
                showVideo(data.movie.url);
                setLoadingState(false);
            } else if (movieStatus === 'error') {
                throw new Error(data.movie.message || 'Ralat berlaku pada enjin JSON2Video');
            } else {
                updateStatusText(`Sedang memproses... (${movieStatus})`);
                setTimeout(() => pollStatus(projectId), 3000);
            }
        } catch (error) {
            console.error(error);
            showErrorState(error.message);
            setLoadingState(false);
        }
    }

    // UI Helper Functions
    function setLoadingState(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner"></i><span>Sedang Menjana...</span>';
            videoContainer.classList.add('hidden');
            statusContainer.classList.remove('hidden');
            statusContainer.innerHTML = `
                <div class="idle-state">
                    <i class="fa-solid fa-wand-sparkles fa-bounce" style="color: var(--primary);"></i>
                    <p id="loadingMsg">Sedang menghantar arahan ke enjin AI...</p>
                </div>
            `;
        } else {
            submitBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i><span>Jana Video Sekarang</span>';
        }
    }

    function updateStatusText(text) {
        const msgEl = document.getElementById('loadingMsg');
        if (msgEl) {
            msgEl.textContent = text;
        }
    }

    function showVideo(url) {
        statusContainer.classList.add('hidden');
        videoContainer.classList.remove('hidden');
        
        resultVideo.src = url;
        resultVideo.load();
        
        downloadBtn.href = url;
    }

    function showErrorState(errorMsg) {
        statusContainer.classList.remove('hidden');
        videoContainer.classList.add('hidden');
        statusContainer.innerHTML = `
            <div class="idle-state" style="color: #ef4444;">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p><strong>Ralat:</strong> ${errorMsg}</p>
            </div>
        `;
    }

    // AI Generation Logic
    const btnGenHikmah = document.getElementById('btnGenHikmah');
    const btnGenMarketing = document.getElementById('btnGenMarketing');
    const motivationText = document.getElementById('motivationText');

    if (btnGenHikmah && btnGenMarketing) {
        btnGenHikmah.addEventListener('click', () => fetchAIQuote('hikmah', btnGenHikmah));
        btnGenMarketing.addEventListener('click', () => fetchAIQuote('marketing', btnGenMarketing));
    }

    async function fetchAIQuote(type, buttonElement) {
        // Simple loading state
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menjana...';
        buttonElement.disabled = true;

        try {
            const res = await fetch('/api/generate-quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                currentQuoteType = type; // Store the type for video generation
                motivationText.value = data.text;
                // Add a little highlight animation class if desired
                motivationText.style.borderColor = "var(--primary)";
                setTimeout(() => motivationText.style.borderColor = "rgba(255, 255, 255, 0.2)", 1000);
            } else {
                alert("Gagal menjana teks AI. Sila cuba lagi.");
            }
        } catch (error) {
            console.error(error);
            alert("Ralat komunikasi dengan server untuk tugasan AI.");
        } finally {
            buttonElement.innerHTML = originalText;
            buttonElement.disabled = false;
        }
    }

});
