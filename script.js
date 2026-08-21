/* ==========================================================================
   J.K. PHOTOGRAPHY STUDIO - SUPABASE POWERED CLIENT JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sync Dynamic Content from Supabase Cloud Database
    await syncSupabaseContent();

    // 2. Active Navigation Link Highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
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

    // 5.1 Shoot Categories Filtering (Indoor Studio vs Outdoor vs Themes)
    setupShootCategoryFilters();

    // 6. Scroll-Triggered Animated Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    function animateStats() {
        const statsSection = document.querySelector('.stats-section');
        if (!statsSection) return;

        const sectionPos = statsSection.getBoundingClientRect().top;
        const screenPos = window.innerHeight / 1.2;

        if (sectionPos < screenPos && !hasAnimated) {
            hasAnimated = true;
            statNumbers.forEach(stat => {
                const target = +stat.getAttribute('data-target');
                const speed = 150;
                const increment = target / speed;

                let count = 0;
                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        stat.innerText = Math.ceil(count);
                        setTimeout(updateCount, 15);
                    } else {
                        stat.innerText = target + '+';
                    }
                };
                updateCount();
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    animateStats();
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
            if (settings.phone_anand) {
                document.querySelectorAll('.top-phone:nth-of-type(1)').forEach(el => {
                    el.innerHTML = `<i class="fa-solid fa-phone"></i> Anand A: ${settings.phone_anand}`;
                });
            }
            if (settings.phone_prasanna) {
                document.querySelectorAll('.top-phone:nth-of-type(2)').forEach(el => {
                    el.innerHTML = `<i class="fa-solid fa-phone"></i> Prasanna Kumar: ${settings.phone_prasanna}`;
                });
            }
            if (settings.map_link) {
                const mapIframe = document.querySelector('.map-card iframe');
                if (mapIframe) mapIframe.src = settings.map_link;
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

        // B. Home Content
        const home = await getSupabaseHome();
        if (home) {
            const heroTitle = document.querySelector('.hero-title');
            if (heroTitle && home.hero_title) {
                heroTitle.innerHTML = home.hero_title.replace(/\n/g, '<br>');
            }
            const heroSubtitle = document.querySelector('.hero-subtitle');
            if (heroSubtitle && home.hero_subtitle) {
                heroSubtitle.innerText = home.hero_subtitle;
            }
            const heroSec = document.querySelector('.hero');
            if (heroSec && home.banner_img) {
                heroSec.style.backgroundImage = `url('${home.banner_img}')`;
            }
        }

        // C. About Content
        const about = await getSupabaseAbout();
        if (about) {
            const aboutH3 = document.querySelector('.about-text-content h3');
            if (aboutH3 && about.title) aboutH3.innerText = about.title;

            const aboutP = document.querySelector('.about-text-content p');
            if (aboutP && about.story) aboutP.innerText = about.story;

            const f1H4 = document.querySelector('.founder-card:nth-child(1) h4');
            if (f1H4 && about.founder1) f1H4.innerText = about.founder1;

            const f2H4 = document.querySelector('.founder-card:nth-child(2) h4');
            if (f2H4 && about.founder2) f2H4.innerText = about.founder2;

            const aboutImg = document.querySelector('.about-img-frame img');
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
