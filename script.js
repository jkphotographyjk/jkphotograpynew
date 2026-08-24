/* ==========================================================================
   J.K. PHOTOGRAPHY STUDIO - SUPABASE POWERED CLIENT JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // 0. Initialize Hero 3-Photo Auto Slider (5-second auto slide)
    initHeroSlider();

    // 0.1 Initialize Customer Reviews Right-to-Left Slider
    initReviewsSlider();

    // 1. Sync Dynamic Content from Supabase Cloud Database
    await syncSupabaseContent();

    // 2. Active Navigation Link Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links > a, .nav-dropdown > .nav-link-btn').forEach(link => {
        const linkPage = link.getAttribute('href')?.split('#')[0];
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
            const parentDropdown = link.closest('.nav-dropdown');
            if (parentDropdown) parentDropdown.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Mobile Dropdown Click Toggle
    document.querySelectorAll('.nav-dropdown > .nav-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const parent = btn.closest('.nav-dropdown');
                if (parent) {
                    const isOpen = parent.classList.contains('open');
                    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
                    if (!isOpen) {
                        e.preventDefault();
                        parent.classList.add('open');
                    }
                }
            }
        });
    });

    // 3. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');

    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
                document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
            }
        });
    }

    // 4. Booking Modal Controls
    const bookingModal = document.getElementById('bookingModal');
    const openBookingBtn = document.getElementById('openBookingBtn');

    if (openBookingBtn && bookingModal) {
        openBookingBtn.addEventListener('click', () => {
            bookingModal.classList.add('active');
        });
    }

    // 5. Portfolio Category Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            document.querySelectorAll('.portfolio-item').forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    // Check URL filter param (e.g., portfolio.html?filter=weddings)
    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');
    if (filterParam) {
        const targetBtn = document.querySelector(`.filter-btn[data-filter="${filterParam}"]`);
        if (targetBtn) targetBtn.click();
    }

    // 5.1 Shoot Categories Filtering (Indoor Studio vs Outdoor vs Themes)
    setupShootCategoryFilters();

    // 6. IntersectionObserver Animated Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    function runStatsAnimation() {
        if (hasAnimated || statNumbers.length === 0) return;
        hasAnimated = true;
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute('data-target') || 0;
            const suffix = stat.getAttribute('data-suffix') !== null ? stat.getAttribute('data-suffix') : '+';
            const prefix = stat.getAttribute('data-prefix') || '';
            const totalDuration = 800; // 800ms total
            const frameRate = 20; // update every 20ms
            const totalFrames = totalDuration / frameRate;
            const increment = target / totalFrames;

            let count = 0;
            const updateCount = () => {
                count += increment;
                if (count < target) {
                    stat.innerText = prefix + Math.floor(count).toLocaleString() + suffix;
                    setTimeout(updateCount, frameRate);
                } else {
                    stat.innerText = prefix + target.toLocaleString() + suffix;
                }
            };
            updateCount();
        });
    }

    const statsSections = document.querySelectorAll('.stats-section');
    if ('IntersectionObserver' in window && statsSections.length > 0) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runStatsAnimation();
                    statsObserver.disconnect();
                }
            });
        }, { threshold: 0.1 });

        statsSections.forEach(s => statsObserver.observe(s));
    } else {
        runStatsAnimation();
    }
});

// Setup Shoot Filter Buttons
function setupShootCategoryFilters() {
    const shootFilterBtns = document.querySelectorAll('.shoot-filter-btn');
    shootFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            shootFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-shoot-filter');
            const shootCards = document.querySelectorAll('.shoot-card');

            shootCards.forEach(card => {
                if (filter === 'all' || card.classList.contains(filter)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Complete Dynamic Supabase Content Synchronizer
async function syncSupabaseContent() {
    try {
        // A. Contacts & Settings
        const settings = await getSupabaseSettings();
        if (settings) {
            if (settings.email) {
                document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
                    el.href = `mailto:${settings.email}`;
                    el.innerHTML = `<i class="fa-solid fa-envelope"></i> ${settings.email}`;
                });
            }
            if (settings.logo_url) {
                document.querySelectorAll('.logo-img').forEach(img => {
                    img.src = settings.logo_url;
                });
            }
            if (settings.phone_prasanna) {
                document.querySelectorAll('.top-phone:nth-of-type(1)').forEach(el => {
                    el.href = `tel:${settings.phone_prasanna.replace(/[^0-9+]/g, '')}`;
                    el.innerHTML = `<i class="fa-solid fa-phone"></i> Prasanna RJ: ${settings.phone_prasanna}`;
                });
            }
            if (settings.phone_anand) {
                document.querySelectorAll('.top-phone:nth-of-type(2)').forEach(el => {
                    el.href = `tel:${settings.phone_anand.replace(/[^0-9+]/g, '')}`;
                    el.innerHTML = `<i class="fa-solid fa-phone"></i> Anand A (Call / WhatsApp): ${settings.phone_anand}`;
                });
            }
            if (settings.map_link) {
                document.querySelectorAll('.map-card iframe').forEach(frame => {
                    frame.src = settings.map_link;
                });
                document.querySelectorAll('.directions-btn').forEach(btn => {
                    btn.href = 'https://maps.app.goo.gl/mUx1DMWZPDTtJFp37?g_st=aw';
                });
            }

            // Promotional / Festive Popup Banner Handler (Pops up whenever website is opened)
            const currentPageName = window.location.pathname.split('/').pop() || 'index.html';
            const isHomeEntry = currentPageName === 'index.html' || currentPageName === '' || currentPageName === '/';

            if (settings.popup_banner_enabled && isHomeEntry) {
                const promoModal = document.getElementById('promoPopupModal');
                const promoImg = document.getElementById('promoBannerImg');
                const promoLink = document.getElementById('promoBannerLink');
                const promoWhatsApp = document.getElementById('promoWhatsAppBtn');

                if (promoImg && settings.popup_banner_img) {
                    promoImg.src = settings.popup_banner_img;
                }
                if (settings.popup_banner_link) {
                    if (promoLink) promoLink.href = settings.popup_banner_link;
                    if (promoWhatsApp) promoWhatsApp.href = settings.popup_banner_link;
                }

                if (promoModal) {
                    setTimeout(() => {
                        promoModal.classList.add('active');
                    }, 500);
                }
            }
        }

        // B. Home Content & Hero Slider
        const home = await getSupabaseHome();
        if (home) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle && home.hero_title) {
                const formattedTitle = home.hero_title
                    .replace(/\\n/g, '<br>')
                    .replace(/\\/g, '<br>')
                    .replace(/\n/g, '<br>')
                    .replace(/<br>\s*<br>/g, '<br>');
                heroTitle.innerHTML = formattedTitle;
            }
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle && home.hero_subtitle) {
                heroSubtitle.innerText = home.hero_subtitle;
            }
            const bannerImages = [home.banner_img, home.banner_img_2, home.banner_img_3].filter(Boolean);
            if (bannerImages.length > 0) {
                initHeroSlider(bannerImages);
            }
        }

        // C. About Content
        const about = await getSupabaseAbout();
        if (about) {
            const aboutH2 = document.querySelector('.about-text-content h2, .about-text-content h3');
            if (aboutH2 && about.title) aboutH2.innerText = about.title;

            const aboutP = document.querySelector('.about-text-content p');
            if (aboutP && about.story) aboutP.innerText = about.story;

            const f1H3 = document.querySelector('.founder-card:nth-child(1) h3, .founder-card:nth-child(1) h4');
            if (f1H3 && about.founder1) f1H3.innerText = about.founder1.split(' - ')[0];

            const f2H3 = document.querySelector('.founder-card:nth-child(2) h3, .founder-card:nth-child(2) h4');
            if (f2H3 && about.founder2) f2H3.innerText = about.founder2.split(' - ')[0];

            const aboutImg = document.querySelector('#aboutStoryImg, .about-story-img, .about-img-frame img, .about-story-grid img');
            if (aboutImg && about.story_img) aboutImg.src = about.story_img;
        }

        // D. Services Grid
        const services = await getSupabaseServices();
        if (services && services.length > 0) {
            const servicesGrids = document.querySelectorAll('.services-grid');
            servicesGrids.forEach(grid => {
                grid.innerHTML = services.map(s => `
                    <div class="service-card">
                        <div class="service-img">
                            <img src="${s.image_url}" alt="${s.title}">
                            <div class="service-icon"><i class="fa-solid ${s.icon || 'fa-camera'}"></i></div>
                        </div>
                        <div class="service-body">
                            <h3>${s.title}</h3>
                            <p>${s.description}</p>
                            <a href="contact.html" class="service-link">Inquire Now <i class="fa-solid fa-arrow-right"></i></a>
                        </div>
                    </div>
                `).join('');
            });
        }

        // E. Shoot Categories (18 Specialized Shoots)
        const shoots = await getSupabaseShootCategories();
        if (shoots && shoots.length > 0) {
            const shootsGrids = document.querySelectorAll('.shoots-grid');
            shootsGrids.forEach(grid => {
                grid.innerHTML = shoots.map(sc => {
                    const isIndoor = sc.badge_indoor_or_outdoor && sc.badge_indoor_or_outdoor.toLowerCase().includes('indoor');
                    const badgeClass = isIndoor ? 'badge-indoor' : 'badge-outdoor';
                    const iconClass = isIndoor ? 'fa-house' : 'fa-tree';

                    return `
                        <div class="shoot-card ${sc.filter_classes}">
                            <div class="shoot-img-wrap">
                                <img src="${sc.image_url}" alt="${sc.title}" loading="lazy">
                                <div class="shoot-badge-group">
                                    <span class="shoot-badge ${badgeClass}"><i class="fa-solid ${iconClass}"></i> ${sc.badge_indoor_or_outdoor}</span>
                                    ${sc.badge_theme ? `<span class="shoot-badge badge-theme">${sc.badge_theme}</span>` : ''}
                                </div>
                            </div>
                            <div class="shoot-body">
                                <h3 class="shoot-title">${sc.title}</h3>
                                <p class="shoot-desc">${sc.description}</p>
                                <div class="shoot-actions">
                                    <button class="btn-whatsapp-sm" onclick="enquireShootWhatsApp('${sc.title.replace(/'/g, "\\'")}')">
                                        <i class="fa-brands fa-whatsapp"></i> WhatsApp
                                    </button>
                                    <button class="btn-book-sm" onclick="openShootBooking('${sc.title.replace(/'/g, "\\'")}')">
                                        <i class="fa-solid fa-calendar-check"></i> Book Shoot
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            });
            setupShootCategoryFilters();
        }

        // F. Portfolio Gallery Grid
        const portfolio = await getSupabasePortfolio();
        if (portfolio && portfolio.length > 0) {
            const portGrid = document.getElementById('portfolioGrid');
            if (portGrid) {
                portGrid.innerHTML = portfolio.map(p => `
                    <div class="portfolio-item ${p.category}" onclick="openLightbox(this)">
                        <img src="${p.image_url}" alt="${p.title}">
                        <div class="portfolio-overlay">
                            <div class="portfolio-info">
                                <span>${p.category}</span>
                                <h4>${p.title}</h4>
                            </div>
                            <div class="zoom-icon"><i class="fa-solid fa-expand"></i></div>
                        </div>
                    </div>
                `).join('');
            }
        }

        // G. Same Day Gifts Grid
        const gifts = await getSupabaseGifts();
        if (gifts && gifts.length > 0) {
            const giftsGrid = document.querySelector('.gifts-grid');
            if (giftsGrid) {
                giftsGrid.innerHTML = gifts.map(g => `
                    <div class="gift-card" onclick="openGiftWhatsApp('${g.title.replace(/'/g, "\\'")}')">
                        <div class="gift-img-wrap">
                            <img src="${g.image_url}" alt="${g.title}">
                        </div>
                        <h5>${g.title}</h5>
                        <button class="gift-btn"><i class="fa-brands fa-whatsapp"></i> Enquire</button>
                    </div>
                `).join('');
            }
        }

        // H. Packages Grid
        const packages = await getSupabasePackages();
        if (packages && packages.length > 0) {
            const pkgCards = document.querySelectorAll('.package-card');
            packages.forEach((pk, idx) => {
                if (pkgCards[idx]) {
                    const h3 = pkgCards[idx].querySelector('.package-header h3');
                    const badge = pkgCards[idx].querySelector('.package-badge');
                    const featuresList = pkgCards[idx].querySelector('.package-features');

                    if (h3 && pk.name) h3.innerText = pk.name;
                    if (badge && pk.badge) badge.innerText = pk.badge;
                    if (featuresList && pk.features) {
                        const feats = Array.isArray(pk.features) ? pk.features : JSON.parse(pk.features || '[]');
                        featuresList.innerHTML = feats.map(f => `
                            <li><i class="fa-solid fa-check"></i> ${f}</li>
                        `).join('');
                    }
                }
            });
        }

        // I. Customer Reviews & Testimonials
        const testimonials = await getSupabaseTestimonials();
        if (testimonials && testimonials.length > 0) {
            const track = document.getElementById('reviewsTrack');
            if (track) {
                track.innerHTML = testimonials.map(t => `
                    <div class="review-card">
                        <div class="review-card-top">
                            <div class="review-stars">
                                ${'<i class="fa-solid fa-star"></i>'.repeat(Math.round(t.rating || 5))}
                            </div>
                            <span class="review-tag">${t.shoot_type || 'Photography'}</span>
                        </div>
                        <p class="review-quote">"${t.review_text}"</p>
                        <div class="review-author">
                            <img src="${t.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}" alt="${t.name}" class="author-avatar">
                            <div class="author-info">
                                <h4>${t.name} <i class="fa-solid fa-circle-check verified-badge" title="Verified Customer"></i></h4>
                                <span>${t.location || 'Bangalore'}</span>
                            </div>
                            <i class="fa-solid fa-quote-right quote-watermark"></i>
                        </div>
                    </div>
                `).join('');
                initReviewsSlider();
            }
        }

    } catch (e) {
        console.error('Supabase Sync error:', e);
    }
}

// Modal close functions
function closeBookingModal() {
    const bookingModal = document.getElementById('bookingModal');
    if (bookingModal) bookingModal.classList.remove('active');
}

function closePromoPopup() {
    const promoModal = document.getElementById('promoPopupModal');
    if (promoModal) promoModal.classList.remove('active');
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const promoModal = document.getElementById('promoPopupModal');
    if (e.target === promoModal) {
        promoModal.classList.remove('active');
    }
    const bookingModal = document.getElementById('bookingModal');
    if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
    }
});

// WhatsApp enquiry for Same Day Gifts
function openGiftWhatsApp(giftName) {
    const message = `Hello J.K. Photography, I am interested in inquiring about the custom "${giftName}". Please share pricing and details.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918553213240?text=${encoded}`, '_blank');
}

// Package Enquiry trigger
function enquirePackage(packageName) {
    const message = `Hello J.K. Photography, I am interested in booking / inquiring about your "${packageName}". Please share details and availability.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918553213240?text=${encoded}`, '_blank');
}

// Shoot Category WhatsApp Enquiry
function enquireShootWhatsApp(shootName) {
    const message = `Hello J.K. Photography, I am interested in booking / inquiring about the "${shootName}". Please share package details, studio slots, and pricing.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918553213240?text=${encoded}`, '_blank');
}

// Open Booking Modal with Pre-selected Shoot Category
function openShootBooking(shootName) {
    const bookingModal = document.getElementById('bookingModal');
    const modalService = document.getElementById('modalService');

    if (modalService && shootName) {
        let found = false;
        for (let i = 0; i < modalService.options.length; i++) {
            if (modalService.options[i].value.toLowerCase() === shootName.toLowerCase() || 
                modalService.options[i].text.toLowerCase().includes(shootName.toLowerCase())) {
                modalService.selectedIndex = i;
                found = true;
                break;
            }
        }
        if (!found) {
            const opt = document.createElement('option');
            opt.value = shootName;
            opt.innerText = shootName;
            opt.selected = true;
            modalService.appendChild(opt);
        }
    }

    if (bookingModal) {
        bookingModal.classList.add('active');
    }
}

// Download Catalogue trigger (From Supabase Storage or WhatsApp fallback)
async function downloadCatalogue() {
    try {
        const settings = await getSupabaseSettings();
        if (settings && settings.catalogue_pdf_url && settings.catalogue_pdf_url.length > 10) {
            const link = document.createElement('a');
            link.href = settings.catalogue_pdf_url;
            link.download = 'JK_Photography_Package_Catalogue.pdf';
            link.target = '_blank';
            link.click();
            return;
        }
    } catch(e){}

    const link = document.createElement('a');
    link.href = 'https://wa.me/918553213240?text=Please%20send%20me%20the%20Package%20Catalogue%20PDF';
    link.target = '_blank';
    link.click();
}

// Form Submission -> Insert into Supabase DB & Format WhatsApp Message
async function handleFormSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const email = document.getElementById('userEmail')?.value || '';
    const service = document.getElementById('serviceType').value;
    const messageText = document.getElementById('userMessage')?.value || '';

    // Direct Cloud Insert to Supabase Postgres
    await insertSupabaseBooking({
        name,
        phone,
        email,
        service,
        event_date: new Date().toLocaleDateString(),
        message: messageText
    });

    const formattedMsg = `*New Website Enquiry - J.K. Photography*%0A%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Phone:* ${encodeURIComponent(phone)}%0A` +
        `*Email:* ${encodeURIComponent(email || 'N/A')}%0A` +
        `*Service Requested:* ${encodeURIComponent(service)}%0A` +
        `*Message/Event Details:* ${encodeURIComponent(messageText || 'N/A')}`;

    window.open(`https://wa.me/918553213240?text=${formattedMsg}`, '_blank');
}

// Modal Booking Submission -> Insert into Supabase DB & Open WhatsApp
async function handleModalBooking(event) {
    event.preventDefault();
    const name = document.getElementById('modalName').value;
    const phone = document.getElementById('modalPhone').value;
    const date = document.getElementById('modalDate').value;
    const service = document.getElementById('modalService').value;

    // Direct Cloud Insert to Supabase Postgres
    await insertSupabaseBooking({
        name,
        phone,
        email: '',
        service,
        event_date: date,
        message: `Booked via website modal for date: ${date}`
    });

    const formattedMsg = `*New Shoot Booking Request*%0A%0A` +
        `*Name:* ${encodeURIComponent(name)}%0A` +
        `*Phone:* ${encodeURIComponent(phone)}%0A` +
        `*Preferred Shoot Date:* ${encodeURIComponent(date)}%0A` +
        `*Service:* ${encodeURIComponent(service)}`;

    closeBookingModal();
    window.open(`https://wa.me/918553213240?text=${formattedMsg}`, '_blank');
}

// Lightbox functions
function openLightbox(element) {
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');

    const imgTag = element.querySelector('img');
    const captionTitle = element.querySelector('.portfolio-info h4')?.innerText || '';

    if (lightboxModal && imgTag) {
        lightboxImg.src = imgTag.src;
        lightboxCaption.innerText = captionTitle;
        lightboxModal.classList.add('active');
    }
}

function closeLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) lightboxModal.classList.remove('active');
}

// ---------------------------------------------------------------------------
// HERO 3-PHOTO AUTO SLIDER ENGINE (5-Second Slideshow)
// ---------------------------------------------------------------------------
let currentHeroSlide = 0;
let heroSlideTimer = null;

function initHeroSlider(images) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    if (!slides.length) return;

    if (images && Array.isArray(images) && images.length > 0) {
        slides.forEach((slide, idx) => {
            if (images[idx]) {
                slide.style.backgroundImage = `url('${images[idx]}')`;
            }
        });
    }

    function showSlide(index) {
        currentHeroSlide = (index + slides.length) % slides.length;
        slides.forEach((s, i) => {
            s.classList.toggle('active', i === currentHeroSlide);
        });
        dots.forEach((d, i) => {
            d.classList.toggle('active', i === currentHeroSlide);
        });
    }

    window.setHeroSlide = function(index) {
        showSlide(index);
        restartHeroTimer();
    };

    function restartHeroTimer() {
        if (heroSlideTimer) clearInterval(heroSlideTimer);
        heroSlideTimer = setInterval(() => {
            showSlide(currentHeroSlide + 1);
        }, 5000);
    }

    showSlide(currentHeroSlide);
    restartHeroTimer();
}

// ---------------------------------------------------------------------------
// CUSTOMER REVIEWS & TESTIMONIALS SLIDER (Right-to-Left Scroll Engine)
// ---------------------------------------------------------------------------
let reviewAutoScrollTimer = null;

function initReviewsSlider() {
    const track = document.getElementById('reviewsTrack');
    const prevBtn = document.getElementById('reviewsPrevBtn');
    const nextBtn = document.getElementById('reviewsNextBtn');
    const dotsContainer = document.getElementById('reviewsDots');
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // Render navigation indicator dots
    function updateDots() {
        if (!dotsContainer) return;
        const cards = track.querySelectorAll('.review-card');
        dotsContainer.innerHTML = '';
        cards.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.className = `review-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                const cardWidth = (cards[0]?.offsetWidth || 340) + 24;
                track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
            });
            dotsContainer.appendChild(dot);
        });
    }

    // Sync active dot on scroll
    function syncActiveDot() {
        if (!dotsContainer) return;
        const cards = track.querySelectorAll('.review-card');
        if (!cards.length) return;
        const cardWidth = (cards[0]?.offsetWidth || 340) + 24;
        const activeIndex = Math.round(track.scrollLeft / cardWidth);
        const dots = dotsContainer.querySelectorAll('.review-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    track.removeEventListener('scroll', syncActiveDot);
    track.addEventListener('scroll', syncActiveDot, { passive: true });

    // Left Button (Previous Review - scroll right)
    if (prevBtn) {
        prevBtn.onclick = () => {
            const cardWidth = (track.querySelector('.review-card')?.offsetWidth || 340) + 24;
            track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            restartReviewAutoScroll();
        };
    }

    // Right Button (Next Review - scroll left / rightwards in track)
    if (nextBtn) {
        nextBtn.onclick = () => {
            const cardWidth = (track.querySelector('.review-card')?.offsetWidth || 340) + 24;
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (track.scrollLeft >= maxScroll - 10) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
            restartReviewAutoScroll();
        };
    }

    // Mouse Drag Scrolling for Desktop
    track.onmousedown = (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
        clearInterval(reviewAutoScrollTimer);
    };

    track.onmouseleave = () => {
        isDown = false;
        restartReviewAutoScroll();
    };

    track.onmouseup = () => {
        isDown = false;
        restartReviewAutoScroll();
    };

    track.onmousemove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
    };

    // Auto Scroll Right-to-Left every 4.5 seconds
    function restartReviewAutoScroll() {
        if (reviewAutoScrollTimer) clearInterval(reviewAutoScrollTimer);
        reviewAutoScrollTimer = setInterval(() => {
            const card = track.querySelector('.review-card');
            if (!card) return;
            const cardWidth = card.offsetWidth + 24;
            const maxScroll = track.scrollWidth - track.clientWidth;
            if (track.scrollLeft >= maxScroll - 10) {
                track.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                track.scrollBy({ left: cardWidth, behavior: 'smooth' });
            }
        }, 4500);
    }

    track.onmouseenter = () => clearInterval(reviewAutoScrollTimer);
    track.ontouchstart = () => clearInterval(reviewAutoScrollTimer);
    track.ontouchend = () => restartReviewAutoScroll();

    updateDots();
    restartReviewAutoScroll();
}
