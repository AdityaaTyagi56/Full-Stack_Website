/**
 * The NSS Chronicle - Main JavaScript
 * Handles newspaper interactions, widgets, and dynamic content.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ========================================
    // 1. Date & Weather Widget
    // ========================================
    function updateDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = new Date().toLocaleDateString('en-US', options);
        }
    }
    updateDate();

    // ========================================
    // 2. Lead Story Slideshow
    // ========================================
    let slides = [
        { src: 'https://via.placeholder.com/800x450/E1AD01/1A1A1A?text=NSS+Volunteers+in+Action', caption: 'Fig 1.1: Volunteers engaged in community service.' },
        { src: 'https://via.placeholder.com/800x450/CDDC39/1A1A1A?text=Tree+Plantation+Drive', caption: 'Fig 1.2: Annual tree plantation drive at Naya Raipur.' },
        { src: 'https://via.placeholder.com/800x450/AFB42B/1A1A1A?text=Blood+Donation+Camp', caption: 'Fig 1.3: Students donating blood for a noble cause.' }
    ];
    
    let currentSlide = 0;
    const slideContainer = document.querySelector('.slideshow-container');
    let slideInterval;

    function initSlideshow() {
        if (!slideContainer) return;
        
        // Create wrapper
        slideContainer.innerHTML = '<div class="slides-wrapper"></div>';
        const wrapper = slideContainer.querySelector('.slides-wrapper');
        
        // Add slides
        slides.forEach(slide => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            slideDiv.innerHTML = `
                <img src="${slide.src}" alt="Slide Image">
                <div class="caption">${slide.caption}</div>
            `;
            wrapper.appendChild(slideDiv);
        });
        
        updateSlidePosition();
    }

    function updateSlidePosition() {
        const wrapper = document.querySelector('.slides-wrapper');
        if (wrapper) {
            wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlidePosition();
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlidePosition();
    }

    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    document.querySelector('.prev-btn')?.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    document.querySelector('.next-btn')?.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    // Initial Start
    initSlideshow();
    resetInterval();

    // ========================================
    // 3. AI Assistant Widget
    // ========================================
    const aiToggle = document.getElementById('aiToggle');
    const aiWindow = document.getElementById('aiWindow');
    const aiClose = document.getElementById('aiClose');
    const aiInput = document.getElementById('aiInput');
    const aiSend = document.getElementById('aiSend');
    const aiMessages = document.getElementById('aiMessages');

    function toggleAI() {
        console.log('Toggling AI Chat Window');
        if (aiWindow) {
            aiWindow.classList.toggle('active');
            if (aiWindow.classList.contains('active') && aiInput) {
                setTimeout(() => aiInput.focus(), 300);
            }
        } else {
            console.error('AI Window element not found!');
        }
    }

    if (aiToggle) {
        aiToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling issues
            toggleAI();
        });
    } else {
        console.error('AI Toggle button not found!');
    }

    if (aiClose) {
        aiClose.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAI();
        });
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('msg', sender);
        
        // Format text: Newlines to <br>, **bold** to <strong>
        const formattedText = text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        msgDiv.innerHTML = formattedText;
        aiMessages.appendChild(msgDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    async function handleAISubmit() {
        const query = aiInput.value.trim();
        if (!query) return;

        addMessage(query, 'user');
        aiInput.value = '';

        // Simulate thinking
        const loadingMsg = document.createElement('div');
        loadingMsg.classList.add('msg', 'ai');
        loadingMsg.textContent = 'Consulting the archives...';
        aiMessages.appendChild(loadingMsg);

        try {
            // Try to hit the backend API
            const res = await fetch(`${CONFIG.API_BASE_URL}/api/ai-chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query })
            });
            
            aiMessages.removeChild(loadingMsg);

            if (res.ok) {
                const data = await res.json();
                addMessage(data.answer, 'ai');
            } else {
                // Fallback response
                addMessage("I'm currently offline, but you can find details in the 'Initiatives' section.", 'ai');
            }
        } catch (e) {
            aiMessages.removeChild(loadingMsg);
            addMessage("Connection to the editorial desk failed. Please try again later.", 'ai');
        }
    }

    if (aiSend) aiSend.addEventListener('click', handleAISubmit);
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAISubmit();
        });
    }

    // ========================================
    // 4. Dynamic Content Loader (CMS)
    // ========================================
    const API_BASE = `${CONFIG.API_BASE_URL}/api`;

    async function loadContent() {
        await Promise.all([
            loadTicker(),
            loadAwards(),
            loadEvents(),
            loadInitiatives(),
            loadGallery(),
            loadLogo(),
            loadSlideshow()
        ]);
    }

    async function loadTicker() {
        const tickerContainer = document.getElementById('ticker-content');
        if (!tickerContainer) return;
        try {
            const res = await fetch(`${API_BASE}/ticker`);
            const items = await res.json();
            if (items.length > 0) {
                tickerContainer.innerHTML = items.map(i => `<span>${i.text}</span>`).join('<span class="separator">•</span>');
            } else {
                tickerContainer.innerHTML = '<span>Welcome to NSS IIIT-NR Chronicle</span>';
            }
        } catch (e) {
            console.error('Ticker load failed', e);
        }
    }

    async function loadAwards() {
        const container = document.getElementById('awards-list');
        if (!container) return;
        try {
            const res = await fetch(`${API_BASE}/awards`);
            const items = await res.json();
            if (items.length > 0) {
                container.innerHTML = items.map(i => `
                    <div class="award-item">
                        <div class="award-year">${i.year}</div>
                        <div class="award-details">
                            <h4>${i.title}</h4>
                            <p>${i.description}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p>No awards recorded yet.</p>';
            }
        } catch (e) {
            console.error('Awards load failed', e);
        }
    }

    async function loadEvents() {
        const container = document.getElementById('event-list-sidebar');
        if (!container) return;
        try {
            const res = await fetch(`${API_BASE}/events`);
            const items = await res.json();
            if (items.length > 0) {
                container.innerHTML = items.map(i => `
                    <li style="margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                        <strong>${i.title}</strong><br>
                        <span style="font-size: 0.9em; color: #555;">📅 ${i.date} | 📍 ${i.location}</span>
                        ${i.description ? `<br><span style="font-size: 0.85em; color: #333; display:block; margin-top:2px;">${i.description}</span>` : ''}
                    </li>
                `).join('');
            } else {
                container.innerHTML = '<li>No upcoming events.</li>';
            }
        } catch (e) {
            console.error('Events load failed', e);
        }
    }

    async function loadInitiatives() {
        const container = document.getElementById('initiatives-grid');
        if (!container) return;
        try {
            const res = await fetch(`${API_BASE}/photos`);
            const photos = await res.json();
            // Filter for initiative categories
            const initiativeCategories = ['education', 'health', 'environment', 'community', 'initiative'];
            const initiatives = photos.filter(p => initiativeCategories.includes(p.category));
            
            if (initiatives.length > 0) {
                container.innerHTML = initiatives.map(p => `
                    <div class="news-card glass-panel">
                        <div class="news-img-wrapper">
                            <span class="category-tag">${p.category.toUpperCase()}</span>
                            <img src="${CONFIG.API_BASE_URL}${p.imageUrl}" alt="${p.title}">
                        </div>
                        <div class="news-content">
                            <h3>${p.title}</h3>
                            <p class="dateline">Latest Update</p>
                            <p>${p.description}</p>
                            <button class="read-more-btn">Read Full Story ➝</button>
                        </div>
                    </div>
                `).join('');
                attachReadMoreListeners();
            } else {
                container.innerHTML = '<p>No active initiatives.</p>';
            }
        } catch (e) {
            console.error('Initiatives load failed', e);
        }
    }

    async function loadGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        try {
            const res = await fetch(`${API_BASE}/photos`);
            const photos = await res.json();
            
            // Filter out initiatives and logo
            const initiativeCategories = ['education', 'health', 'environment', 'community', 'initiative'];
            const galleryPhotos = photos.filter(p => !initiativeCategories.includes(p.category) && p.category !== 'logo' && p.category !== 'slideshow');
            
            if (galleryPhotos.length === 0) {
                grid.innerHTML = '<p>No gallery photos available.</p>';
                return;
            }

            grid.innerHTML = galleryPhotos.map(p => `
                <div class="photo-item">
                    <img src="${CONFIG.API_BASE_URL}${p.imageUrl}" alt="${p.title}">
                    <div class="photo-caption">
                        <strong>${p.title}</strong><br>
                        ${p.description || ''}
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.log('Backend not connected or no photos');
        }
    }

    async function loadLogo() {
        try {
            const res = await fetch(`${API_BASE}/photos`);
            const photos = await res.json();
            const logoPhoto = photos.find(p => p.category === 'logo');
            if (logoPhoto) {
                const logoImgs = document.querySelectorAll('.logo-stamp img');
                logoImgs.forEach(img => img.src = `${CONFIG.API_BASE_URL}${logoPhoto.imageUrl}`);
            }
        } catch (e) {
            console.error('Logo load failed', e);
        }
    }

    async function loadSlideshow() {
        try {
            const res = await fetch(`${API_BASE}/photos`);
            const photos = await res.json();
            const slideshowPhotos = photos.filter(p => p.category === 'slideshow');
            
            if (slideshowPhotos.length > 0) {
                slides = slideshowPhotos.map(p => ({
                    src: `${CONFIG.API_BASE_URL}${p.imageUrl}`,
                    caption: p.description || p.title
                }));
                currentSlide = 0;
                initSlideshow();
                resetInterval();
            }
        } catch (e) {
            console.error('Slideshow load failed', e);
        }
    }

    loadContent();

    // ========================================
    // 5. Smooth Scrolling
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // ========================================
    // 6. AI Story Generator (Read Full Story)
    // ========================================
    const modal = document.getElementById('storyModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.querySelector('.close-modal');

    if (modal && closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    function attachReadMoreListeners() {
        document.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const card = e.target.closest('.news-card');
                const title = card.querySelector('h3').textContent;
                const context = card.querySelector('p:not(.dateline)').textContent;
                
                if (modal) {
                    modalTitle.textContent = title;
                    modalBody.innerHTML = '<div class="loading-spinner">Generating story with AI...</div>';
                    modal.style.display = 'flex';
                }

                try {
                    const res = await fetch(`${CONFIG.API_BASE_URL}/api/generate-story`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ topic: title, context: context })
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        if (modalBody) modalBody.textContent = data.story;
                    } else {
                        if (modalBody) modalBody.textContent = "Failed to generate story. Please try again.";
                    }
                } catch (err) {
                    console.error(err);
                    if (modalBody) modalBody.textContent = "Error connecting to AI service. Is the backend running?";
                }
            });
        });
    }
    // Initial attach for static content (if any)
    attachReadMoreListeners();

});
