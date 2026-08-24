/* ==========================================================================
   JK PHOTOGRAPHY STUDIO - SUPABASE CLOUD CMS ADMIN CONTROLLER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
    checkAdminAuth();
});

// Check if currently authenticated in current browser session
async function checkAdminAuth() {
    const isAuth = sessionStorage.getItem('JK_ADMIN_LOGGED_IN');
    const loginWrapper = document.getElementById('loginWrapper');
    const adminDashboard = document.getElementById('adminDashboard');

    if (isAuth === 'true') {
        if (loginWrapper) loginWrapper.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'block';
        setupImagePreviewListeners();
        await loadAllAdminData();
    } else {
        if (loginWrapper) loginWrapper.style.display = 'flex';
        if (adminDashboard) adminDashboard.style.display = 'none';
    }
}

function setupImagePreviewListeners() {
    [1, 2, 3].forEach(num => {
        const fileInput = document.getElementById(`editHeroImgFile${num}`);
        const previewImg = document.getElementById(`homeBannerPreview${num}`);
        if (fileInput && previewImg) {
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { previewImg.src = ev.target.result; };
                    reader.readAsDataURL(file);
                }
            });
        }
    });

    const filePairs = [
        { inputId: 'editAboutImgFile', previewId: 'aboutImgPreview' },
        { inputId: 'logoFile', previewId: 'logoPreview' },
        { inputId: 'popupBannerFile', previewId: 'popupBannerPreview' }
    ];

    filePairs.forEach(({ inputId, previewId }) => {
        const input = document.getElementById(inputId);
        const preview = document.getElementById(previewId);
        if (input && preview) {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => { preview.src = ev.target.result; };
                    reader.readAsDataURL(file);
                }
            });
        }
    });
}

// Handle Admin Login (Verifies against password in Supabase)
async function handleAdminLogin(event) {
    event.preventDefault();
    const enteredPass = document.getElementById('adminPass').value;
    const submitBtn = document.getElementById('loginSubmitBtn');

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> VERIFYING...';
        }

        const settings = await getSupabaseSettings();
        const correctPassword = settings?.password || 'admin';

        if (enteredPass === correctPassword) {
            sessionStorage.setItem('JK_ADMIN_LOGGED_IN', 'true');
            alert('Login successful! Welcome to J.K. Photography Cloud Admin.');
            await checkAdminAuth();
        } else {
            alert('Incorrect password! Please try again.');
        }
    } catch (err) {
        console.error('Login error:', err);
        alert('Login failed. Please check your internet connection.');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> LOGIN TO CLOUD DASHBOARD';
        }
    }
}

// Handle Logout
function handleAdminLogout() {
    sessionStorage.removeItem('JK_ADMIN_LOGGED_IN');
    alert('Logged out successfully.');
    window.location.reload();
}

// Switch Sidebar Tabs
function switchAdminTab(tabId, btnElement) {
    document.querySelectorAll('.admin-tab-pane').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-nav-btn').forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (btnElement) {
        btnElement.classList.add('active');
        
        // Update Mobile Dropdown Title display
        const display = document.getElementById('adminActiveTabDisplay');
        if (display) {
            display.innerHTML = btnElement.innerHTML;
        }
    }

    // Auto-close mobile sidebar drawer after selection
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
}

// Toggle Mobile Admin Navigation Menu Drawer
function toggleAdminMobileNav() {
    const sidebar = document.getElementById('adminSidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// ---------------------------------------------------------------------------
// LOAD ALL DATA FROM SUPABASE INTO ADMIN FORMS
// ---------------------------------------------------------------------------
async function loadAllAdminData() {
    try {
        // 1. Settings & Contacts
        const settings = await getSupabaseSettings();
        if (settings) {
            const anandInput = document.getElementById('editAnandPhone');
            const prasannaInput = document.getElementById('editPrasannaPhone');
            const emailInput = document.getElementById('editEmail');
            const addressInput = document.getElementById('editAddress');
            const logoPreview = document.getElementById('logoPreview');
            const mapInput = document.getElementById('editContactMapLink');
            const pdfStatus = document.getElementById('pdfStatusMsg');

            // Popup Banner Inputs
            const popupEnabled = document.getElementById('editPopupEnabled');
            const popupTitle = document.getElementById('editPopupTitle');
            const popupPreview = document.getElementById('popupBannerPreview');
            const popupLink = document.getElementById('editPopupLink');

            if (popupEnabled) popupEnabled.checked = settings.popup_banner_enabled !== false;
            if (popupTitle) popupTitle.value = settings.popup_banner_title || '';
            if (popupPreview && settings.popup_banner_img) popupPreview.src = settings.popup_banner_img;
            if (popupLink) popupLink.value = settings.popup_banner_link || '';

            if (anandInput) anandInput.value = settings.phone_anand || '';
            if (prasannaInput) prasannaInput.value = settings.phone_prasanna || '';
            if (emailInput) emailInput.value = settings.email || '';
            if (addressInput) addressInput.value = settings.address || '';
            if (logoPreview && settings.logo_url) logoPreview.src = settings.logo_url;
            if (mapInput) mapInput.value = settings.map_link || '';
            if (pdfStatus) {
                pdfStatus.innerHTML = settings.catalogue_pdf_url 
                    ? `<i class="fa-solid fa-check-circle"></i> Active PDF in Supabase Storage: <a href="${settings.catalogue_pdf_url}" target="_blank" style="color: var(--gold-light); text-decoration: underline;">View Current PDF</a>`
                    : 'No custom PDF uploaded yet. WhatsApp fallback is active.';
            }
        }

        // 2. Home Content & Hero 3-Photo Auto Slider
        const home = await getSupabaseHome();
        if (home) {
            const heroTitle = document.getElementById('editHeroTitle');
            const heroSubtitle = document.getElementById('editHeroSubtitle');
            const bannerPreview1 = document.getElementById('homeBannerPreview1');
            const bannerPreview2 = document.getElementById('homeBannerPreview2');
            const bannerPreview3 = document.getElementById('homeBannerPreview3');

            if (heroTitle) heroTitle.value = home.hero_title || '';
            if (heroSubtitle) heroSubtitle.value = home.hero_subtitle || '';
            if (bannerPreview1 && home.banner_img) bannerPreview1.src = home.banner_img;
            if (bannerPreview2 && home.banner_img_2) bannerPreview2.src = home.banner_img_2;
            if (bannerPreview3 && home.banner_img_3) bannerPreview3.src = home.banner_img_3;
        }

        // 3. About Content
        const about = await getSupabaseAbout();
        if (about) {
            const aboutTitle = document.getElementById('editAboutTitle');
            const aboutStory = document.getElementById('editAboutStory');
            const founder1 = document.getElementById('editFounder1');
            const founder2 = document.getElementById('editFounder2');
            const aboutImgPreview = document.getElementById('aboutImgPreview');

            if (aboutTitle) aboutTitle.value = about.title || '';
            if (aboutStory) aboutStory.value = about.story || '';
            if (founder1) founder1.value = about.founder1 || '';
            if (founder2) founder2.value = about.founder2 || '';
            if (aboutImgPreview && about.story_img) aboutImgPreview.src = about.story_img;
        }

        // 4. Services List
        await loadAdminServices();

        // 5. Shoot Categories List
        await loadAdminShoots();

        // 6. Portfolio Items
        await loadAdminPortfolio();

        // 7. Gifts List
        await loadAdminGifts();

        // 8. Packages List
        await loadAdminPackages();

        // 9. Bookings Log
        await loadAdminBookings();

    } catch (e) {
        console.error('Error loading admin data from Supabase:', e);
    }
}

// ---------------------------------------------------------------------------
// 0. SAVE POPUP BANNER SETTINGS (Supabase DB & Storage)
// ---------------------------------------------------------------------------
async function savePopupBannerSettings(event) {
    event.preventDefault();
    const btn = document.getElementById('savePopupBannerBtn');
    const popup_banner_enabled = document.getElementById('editPopupEnabled').checked;
    const popup_banner_title = document.getElementById('editPopupTitle').value;
    const popup_banner_link = document.getElementById('editPopupLink').value;
    const file = document.getElementById('popupBannerFile').files[0];

    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SAVING...'; }

        let popup_banner_img = document.getElementById('popupBannerPreview').src;
        if (file) {
            popup_banner_img = await uploadToSupabaseStorage(file, 'popups');
            document.getElementById('popupBannerPreview').src = popup_banner_img;
        }

        const { error } = await db.from('site_settings').update({
            popup_banner_enabled,
            popup_banner_title,
            popup_banner_img,
            popup_banner_link,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;
        alert('Festive / Promotional Popup Banner saved to Supabase successfully!');
    } catch (e) {
        console.error(e);
        alert('Failed to save popup banner: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE POPUP BANNER TO SUPABASE'; }
    }
}

// ---------------------------------------------------------------------------
// 1. SAVE CONTACTS
// ---------------------------------------------------------------------------
async function saveContactSettings(event) {
    event.preventDefault();
    const btn = document.getElementById('saveContactsBtn');
    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SAVING...'; }

        const phone_anand = document.getElementById('editAnandPhone').value;
        const phone_prasanna = document.getElementById('editPrasannaPhone').value;
        const email = document.getElementById('editEmail').value;
        const address = document.getElementById('editAddress').value;

        const { error } = await db.from('site_settings').update({
            phone_anand,
            phone_prasanna,
            email,
            address,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;
        alert('Contact settings saved to Supabase Cloud Database successfully!');
    } catch (e) {
        console.error(e);
        alert('Failed to save contacts: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE CONTACT DETAILS TO CLOUD'; }
    }
}

// ---------------------------------------------------------------------------
// 2. LOGO UPLOAD (Supabase Storage)
// ---------------------------------------------------------------------------
async function saveLogoUpload(event) {
    event.preventDefault();
    const file = document.getElementById('logoFile').files[0];
    const btn = document.getElementById('saveLogoBtn');

    if (!file) {
        alert('Please select an image file to upload.');
        return;
    }

    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING TO STORAGE...'; }

        const publicUrl = await uploadToSupabaseStorage(file, 'logo');
        const { error } = await db.from('site_settings').update({
            logo_url: publicUrl,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;

        document.getElementById('logoPreview').src = publicUrl;
        alert('Logo uploaded to Supabase Storage and updated successfully!');
    } catch (e) {
        console.error(e);
        alert('Failed to upload logo: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-upload"></i> UPLOAD TO SUPABASE STORAGE'; }
    }
}

// ---------------------------------------------------------------------------
// 3. SAVE HOME PAGE
// ---------------------------------------------------------------------------
async function saveHomeSettings(event) {
    event.preventDefault();
    const hero_title = document.getElementById('editHeroTitle').value;
    const hero_subtitle = document.getElementById('editHeroSubtitle').value;
    const file1 = document.getElementById('editHeroImgFile1')?.files[0];
    const file2 = document.getElementById('editHeroImgFile2')?.files[0];
    const file3 = document.getElementById('editHeroImgFile3')?.files[0];
    const btn = document.getElementById('saveHomeBtn');

    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING & SAVING...'; }

        let banner_img = document.getElementById('homeBannerPreview1')?.src || '';
        let banner_img_2 = document.getElementById('homeBannerPreview2')?.src || '';
        let banner_img_3 = document.getElementById('homeBannerPreview3')?.src || '';

        if (file1) {
            banner_img = await uploadToSupabaseStorage(file1, 'home');
            if (document.getElementById('homeBannerPreview1')) document.getElementById('homeBannerPreview1').src = banner_img;
        }
        if (file2) {
            banner_img_2 = await uploadToSupabaseStorage(file2, 'home');
            if (document.getElementById('homeBannerPreview2')) document.getElementById('homeBannerPreview2').src = banner_img_2;
        }
        if (file3) {
            banner_img_3 = await uploadToSupabaseStorage(file3, 'home');
            if (document.getElementById('homeBannerPreview3')) document.getElementById('homeBannerPreview3').src = banner_img_3;
        }

        const { error } = await db.from('home_content').update({
            hero_title,
            hero_subtitle,
            banner_img,
            banner_img_2,
            banner_img_3,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;
        alert('Home page hero 3-photo slider and content saved to Supabase successfully!');
    } catch (e) {
        console.error(e);
        alert('Failed to save home page: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE HERO BANNER & HOME PAGE TO SUPABASE'; }
    }
}

// ---------------------------------------------------------------------------
// 4. SAVE ABOUT PAGE
// ---------------------------------------------------------------------------
async function saveAboutSettings(event) {
    event.preventDefault();
    const title = document.getElementById('editAboutTitle').value;
    const story = document.getElementById('editAboutStory').value;
    const founder1 = document.getElementById('editFounder1').value;
    const founder2 = document.getElementById('editFounder2').value;
    const file = document.getElementById('editAboutImgFile').files[0];
    const btn = document.getElementById('saveAboutBtn');

    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> SAVING...'; }

        let story_img = document.getElementById('aboutImgPreview').src;
        if (file) {
            story_img = await uploadToSupabaseStorage(file, 'about');
            document.getElementById('aboutImgPreview').src = story_img;
        }

        const { error } = await db.from('about_content').update({
            title,
            story,
            founder1,
            founder2,
            story_img,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;
        alert('About Us content saved to Supabase successfully!');
    } catch (e) {
        console.error(e);
        alert('Failed to save about page: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE ABOUT US PAGE'; }
    }
}

// ---------------------------------------------------------------------------
// 5. SERVICES CRUD
// ---------------------------------------------------------------------------
async function loadAdminServices() {
    const list = document.getElementById('adminServicesList');
    if (!list) return;

    const services = await getSupabaseServices();
    list.innerHTML = services.map(s => `
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; margin-bottom: 15px; display: flex; gap: 15px; align-items: center; justify-content: space-between;">
            <img src="${s.image_url}" alt="${s.title}" style="width: 80px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-color);">
            <div style="flex: 1;">
                <h5 style="color: var(--gold-light); font-family: var(--font-heading); margin-bottom: 4px;">${s.title}</h5>
                <p style="font-size: 0.85rem; color: var(--text-muted);">${s.description}</p>
            </div>
            <button class="btn btn-danger" onclick="deleteServiceItem('${s.id}')" style="padding: 6px 12px; font-size: 0.8rem;">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

async function addNewServiceItem(event) {
    event.preventDefault();
    const btn = document.getElementById('addServiceBtn');
    const title = document.getElementById('newServiceTitle').value;
    const description = document.getElementById('newServiceDesc').value;
    const file = document.getElementById('newServiceImgFile').files[0];

    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING & SAVING...'; }

        const image_url = await uploadToSupabaseStorage(file, 'services');
        const id = 'svc_' + Date.now();

        const { error } = await db.from('services').insert([{
            id,
            title,
            description,
            icon: 'fa-camera',
            image_url,
            display_order: 99
        }]);

        if (error) throw error;
        alert(`Service "${title}" added to Supabase database successfully!`);
        event.target.reset();
        await loadAdminServices();
    } catch (e) {
        console.error(e);
        alert('Failed to add service: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-plus"></i> ADD SERVICE'; }
    }
}

async function deleteServiceItem(id) {
    if (!confirm('Are you sure you want to delete this service from Supabase?')) return;
    try {
        const { error } = await db.from('services').delete().eq('id', id);
        if (error) throw error;
        alert('Service deleted successfully!');
        await loadAdminServices();
    } catch (e) {
        console.error(e);
        alert('Failed to delete service: ' + e.message);
    }
}

// ---------------------------------------------------------------------------
// 5.1 SHOOT CATEGORIES (SPECIALIZED SHOOTS) CRUD
// ---------------------------------------------------------------------------
async function loadAdminShoots() {
    const list = document.getElementById('adminShootsList');
    if (!list) return;

    const shoots = await getSupabaseShootCategories();
    list.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
            ${shoots.map(sc => `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; display: flex; flex-direction: column;">
                    <img src="${sc.image_url}" alt="${sc.title}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px; margin-bottom: 10px;">
                    <span style="font-size: 0.72rem; color: var(--gold-light); font-weight: 700; text-transform: uppercase;">${sc.badge_indoor_or_outdoor} ${sc.badge_theme ? '| ' + sc.badge_theme : ''}</span>
                    <h5 style="color: #fff; font-family: var(--font-heading); margin: 6px 0;">${sc.title}</h5>
                    <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px; flex-grow: 1;">${sc.description}</p>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-outline" onclick="openEditShootModal('${sc.id}')" style="flex: 1; padding: 6px; font-size: 0.75rem;">
                            <i class="fa-solid fa-pen-to-square"></i> Edit Details & Photo
                        </button>
                        <button class="btn btn-danger" onclick="deleteShootItem('${sc.id}')" style="padding: 6px 12px; font-size: 0.75rem;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

async function addNewShootCategory(event) {
    event.preventDefault();
    const btn = document.getElementById('addShootBtn');
    const title = document.getElementById('newShootTitle').value;
    const locationBadge = document.getElementById('newShootLocation').value;
    const filterClass = document.getElementById('newShootFilter').value;
    const themeBadge = document.getElementById('newShootTheme').value || '';
    const description = document.getElementById('newShootDesc').value;
    const file = document.getElementById('newShootImgFile').files[0];

    try {
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING & SAVING...'; }

        const image_url = await uploadToSupabaseStorage(file, 'shoots');
        const id = 'shoot_' + Date.now();
        const isIndoor = locationBadge.toLowerCase().includes('indoor');
        const finalFilterClasses = `${isIndoor ? 'indoor' : 'outdoor'} ${filterClass}`;

        const { error } = await db.from('shoot_categories').insert([{
            id,
            title,
            description,
            image_url,
            filter_classes: finalFilterClasses,
            badge_indoor_or_outdoor: locationBadge,
            badge_theme: themeBadge,
            display_order: 99
        }]);

        if (error) throw error;
        alert(`Specialized Shoot "${title}" added to Supabase database!`);
        event.target.reset();
        await loadAdminShoots();
    } catch (e) {
        console.error(e);
        alert('Failed to add shoot category: ' + e.message);
    } finally {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-plus"></i> ADD TO INDOOR/OUTDOOR SHOOTS'; }
    }
}

async function deleteShootItem(id) {
    if (!confirm('Are you sure you want to delete this shoot category from Supabase?')) return;
    try {
        const { error } = await db.from('shoot_categories').delete().eq('id', id);
        if (error) throw error;
        alert('Shoot category deleted!');
        await loadAdminShoots();
    } catch (e) {
        console.error(e);
        alert('Failed to delete shoot: ' + e.message);
    }
}

// Open Full Edit Modal for any Shoot Card
async function openEditShootModal(id) {
    try {
        const { data: shoot, error } = await db.from('shoot_categories').select('*').eq('id', id).single();
        if (error || !shoot) {
            alert('Could not load shoot category details from Supabase.');
            return;
        }

        document.getElementById('editShootId').value = shoot.id;
        document.getElementById('editShootCurrentImageUrl').value = shoot.image_url || '';
        document.getElementById('editShootTitle').value = shoot.title || '';
        document.getElementById('editShootLocation').value = shoot.badge_indoor_or_outdoor || 'Indoor Studio';
        
        // Determine filter class
        const filterCls = shoot.filter_classes || '';
        let selFilter = 'all';
        if (filterCls.includes('maternity-baby')) selFilter = 'maternity-baby';
        else if (filterCls.includes('matrimonial-profile')) selFilter = 'matrimonial-profile';
        else if (filterCls.includes('themes-cultural')) selFilter = 'themes-cultural';
        document.getElementById('editShootFilter').value = selFilter;

        document.getElementById('editShootTheme').value = shoot.badge_theme || '';
        document.getElementById('editShootDesc').value = shoot.description || '';
        document.getElementById('editShootImgPreview').src = shoot.image_url || '';
        document.getElementById('editShootImgFile').value = '';

        const modal = document.getElementById('editShootModal');
        if (modal) modal.classList.add('active');
    } catch (err) {
        console.error(err);
        alert('Error loading shoot data for editing');
    }
}

function closeEditShootModal() {
    const modal = document.getElementById('editShootModal');
    if (modal) modal.classList.remove('active');
}

async function saveEditedShootCategory(event) {
    event.preventDefault();
    const btn = document.getElementById('saveEditShootBtn');
    const id = document.getElementById('editShootId').value;
    const title = document.getElementById('editShootTitle').value;
    const locationBadge = document.getElementById('editShootLocation').value;
    const filterClass = document.getElementById('editShootFilter').value;
    const themeBadge = document.getElementById('editShootTheme').value || '';
    const description = document.getElementById('editShootDesc').value;
    const currentImageUrl = document.getElementById('editShootCurrentImageUrl').value;
    const file = document.getElementById('editShootImgFile').files[0];

    try {
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> UPLOADING & SAVING TO SUPABASE...';
        }

        let finalImageUrl = currentImageUrl;
        if (file) {
            finalImageUrl = await uploadToSupabaseStorage(file, 'shoots');
        }

        const isIndoor = locationBadge.toLowerCase().includes('indoor');
        const finalFilterClasses = `${isIndoor ? 'indoor' : 'outdoor'} ${filterClass}`;

        const { error } = await db.from('shoot_categories').update({
            title,
            description,
            image_url: finalImageUrl,
            filter_classes: finalFilterClasses,
            badge_indoor_or_outdoor: locationBadge,
            badge_theme: themeBadge
        }).eq('id', id);

        if (error) throw error;

        alert(`Shoot "${title}" updated successfully in Supabase!`);
        closeEditShootModal();
        await loadAdminShoots();
    } catch (e) {
        console.error('Error saving shoot category:', e);
        alert('Failed to update shoot category: ' + e.message);
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SAVE CHANGES TO SUPABASE';
        }
    }
}

// ---------------------------------------------------------------------------
// 6. PORTFOLIO CRUD
// ---------------------------------------------------------------------------
async function loadAdminPortfolio() {
    const list = document.getElementById('adminPortfolioList');
    if (!list) return;

    const portfolio = await getSupabasePortfolio();
    list.innerHTML = portfolio.map(p => `
        <div class="portfolio-item ${p.category}">
            <img src="${p.image_url}" alt="${p.title}">
            <div class="portfolio-overlay" style="opacity: 1; background: rgba(0,0,0,0.7); display: flex; flex-direction: column; justify-content: space-between; padding: 15px;">
                <div>
                    <span style="font-size: 0.75rem; color: var(--gold-light); text-transform: uppercase;">${p.category}</span>
                    <h5 style="color: #fff; font-size: 0.9rem;">${p.title}</h5>
                </div>
                <button class="btn btn-danger" onclick="deletePortfolioPhoto('${p.id}')" style="padding: 4px 10px; font-size: 0.75rem; align-self: flex-start;">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

async function addNewPortfolioPhoto(event) {
    event.preventDefault();
    const title = document.getElementById('newPortTitle').value;
    const category = document.getElementById('newPortCategory').value;
    const file = document.getElementById('newPortImgFile').files[0];

    try {
        const image_url = await uploadToSupabaseStorage(file, 'portfolio');
        const id = 'port_' + Date.now();

        const { error } = await db.from('portfolio_items').insert([{
            id,
            title,
            category,
            image_url,
            display_order: 99
        }]);

        if (error) throw error;
        alert('Portfolio photo uploaded to Supabase Storage and saved to DB!');
        event.target.reset();
        await loadAdminPortfolio();
    } catch (e) {
        console.error(e);
        alert('Failed to add portfolio photo: ' + e.message);
    }
}

async function deletePortfolioPhoto(id) {
    if (!confirm('Are you sure you want to delete this photo from Supabase?')) return;
    try {
        const { error } = await db.from('portfolio_items').delete().eq('id', id);
        if (error) throw error;
        alert('Portfolio item deleted!');
        await loadAdminPortfolio();
    } catch (e) {
        console.error(e);
        alert('Failed to delete photo: ' + e.message);
    }
}

// ---------------------------------------------------------------------------
// 7. SAME DAY GIFTS CRUD
// ---------------------------------------------------------------------------
async function loadAdminGifts() {
    const list = document.getElementById('adminGiftsList');
    if (!list) return;

    const gifts = await getSupabaseGifts();
    list.innerHTML = gifts.map(g => `
        <div class="gift-card" style="padding: 15px;">
            <div class="gift-img-wrap">
                <img src="${g.image_url}" alt="${g.title}">
            </div>
            <h5 style="margin: 10px 0;">${g.title}</h5>
            <button class="btn btn-danger" onclick="deleteGiftItem('${g.id}')" style="padding: 4px 10px; font-size: 0.75rem; width: 100%;">
                <i class="fa-solid fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

async function addNewGiftItem(event) {
    event.preventDefault();
    const title = document.getElementById('newGiftTitle').value;
    const file = document.getElementById('newGiftImgFile').files[0];

    try {
        const image_url = await uploadToSupabaseStorage(file, 'gifts');
        const id = 'gift_' + Date.now();

        const { error } = await db.from('gifts').insert([{
            id,
            title,
            image_url,
            display_order: 99
        }]);

        if (error) throw error;
        alert('New gift product added to Supabase!');
        event.target.reset();
        await loadAdminGifts();
    } catch (e) {
        console.error(e);
        alert('Failed to add gift item: ' + e.message);
    }
}

async function deleteGiftItem(id) {
    if (!confirm('Are you sure you want to delete this gift item?')) return;
    try {
        const { error } = await db.from('gifts').delete().eq('id', id);
        if (error) throw error;
        alert('Gift product deleted!');
        await loadAdminGifts();
    } catch (e) {
        console.error(e);
        alert('Failed to delete gift item: ' + e.message);
    }
}

// ---------------------------------------------------------------------------
// 8. PACKAGES & CATALOGUE PDF UPLOAD (Supabase Storage)
// ---------------------------------------------------------------------------
async function saveCataloguePDFUpload(event) {
    event.preventDefault();
    const file = document.getElementById('pdfCatalogueFile').files[0];
    if (!file) { alert('Please select a PDF file.'); return; }

    try {
        const pdfUrl = await uploadToSupabaseStorage(file, 'catalogues');
        const { error } = await db.from('site_settings').update({
            catalogue_pdf_url: pdfUrl,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;

        document.getElementById('pdfStatusMsg').innerHTML = `
            <i class="fa-solid fa-check-circle"></i> Successfully uploaded to Supabase Storage: 
            <a href="${pdfUrl}" target="_blank" style="color: var(--gold-light); text-decoration: underline;">View Live PDF</a>
        `;
        alert('Package Catalogue PDF uploaded to Supabase Storage successfully!');
    } catch (e) {
        console.error(e);
        alert('Failed to upload PDF: ' + e.message);
    }
}

async function loadAdminPackages() {
    const list = document.getElementById('adminPackagesList');
    if (!list) return;

    const packages = await getSupabasePackages();
    list.innerHTML = packages.map((pk, idx) => {
        const feats = Array.isArray(pk.features) ? pk.features : JSON.parse(pk.features || '[]');
        return `
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h4 style="color: var(--gold-light); font-family: var(--font-heading); margin: 0;">Tier ${idx + 1}: ${pk.name} (${pk.badge})</h4>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Package Name</label>
                        <input type="text" id="pkg_name_${pk.id}" value="${pk.name}">
                    </div>
                    <div class="form-group">
                        <label>Package Badge (e.g. Standard, Luxury)</label>
                        <input type="text" id="pkg_badge_${pk.id}" value="${pk.badge}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Deliverables / Features (One item per line)</label>
                    <textarea id="pkg_feats_${pk.id}" rows="4">${feats.join('\n')}</textarea>
                </div>
                <button class="btn btn-gold" onclick="savePackageItem('${pk.id}')" style="padding: 8px 16px; font-size: 0.85rem;">
                    <i class="fa-solid fa-floppy-disk"></i> Save Package Tier to Supabase
                </button>
            </div>
        `;
    }).join('');
}

async function savePackageItem(id) {
    const name = document.getElementById(`pkg_name_${id}`).value;
    const badge = document.getElementById(`pkg_badge_${id}`).value;
    const featsRaw = document.getElementById(`pkg_feats_${id}`).value;
    const features = featsRaw.split('\n').map(f => f.trim()).filter(f => f.length > 0);

    try {
        const { error } = await db.from('packages').update({
            name,
            badge,
            features
        }).eq('id', id);

        if (error) throw error;
        alert(`Package tier updated in Supabase database!`);
    } catch (e) {
        console.error(e);
        alert('Failed to save package: ' + e.message);
    }
}

// ---------------------------------------------------------------------------
// 9. CONTACT PAGE SETTINGS
// ---------------------------------------------------------------------------
async function saveContactPageSettings(event) {
    event.preventDefault();
    const map_link = document.getElementById('editContactMapLink').value;

    try {
        const { error } = await db.from('site_settings').update({
            map_link,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;
        alert('Contact page Google Map link saved to Supabase!');
    } catch (e) {
        console.error(e);
        alert('Failed to save map link: ' + e.message);
    }
}

// ---------------------------------------------------------------------------
// 10. BOOKINGS & INQUIRIES LOG (Live Supabase Queries)
// ---------------------------------------------------------------------------
async function loadAdminBookings() {
    const tableBody = document.getElementById('adminBookingsTable');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading bookings from Supabase Cloud...</td></tr>';

    const bookings = await getSupabaseBookings();
    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 25px; color: var(--text-muted);">No enquiries or bookings recorded in Supabase yet.</td></tr>';
        return;
    }

    tableBody.innerHTML = bookings.map(b => {
        const createdDate = b.created_at ? new Date(b.created_at).toLocaleDateString() : 'N/A';
        return `
            <tr>
                <td style="font-weight: 600; color: #fff;">${b.name}</td>
                <td>
                    <a href="tel:${b.phone}" style="color: var(--gold-light);"><i class="fa-solid fa-phone"></i> ${b.phone}</a>
                </td>
                <td><span style="color: #fff;">${b.service}</span></td>
                <td>${b.event_date || createdDate}</td>
                <td>
                    <select onchange="updateBookingStatus('${b.id}', this.value)" style="background: #111; color: var(--gold-light); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">
                        <option value="New" ${b.status === 'New' ? 'selected' : ''}>New</option>
                        <option value="Contacted" ${b.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="deleteBooking('${b.id}')" style="padding: 4px 8px; font-size: 0.75rem;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function updateBookingStatus(id, status) {
    try {
        const { error } = await db.from('bookings').update({ status }).eq('id', id);
        if (error) throw error;
    } catch (e) {
        console.error(e);
        alert('Failed to update booking status');
    }
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to remove this enquiry from Supabase?')) return;
    try {
        const { error } = await db.from('bookings').delete().eq('id', id);
        if (error) throw error;
        await loadAdminBookings();
    } catch (e) {
        console.error(e);
        alert('Failed to delete booking');
    }
}

// ---------------------------------------------------------------------------
// 11. CHANGE ADMIN PASSWORD
// ---------------------------------------------------------------------------
async function handleChangePassword(event) {
    event.preventDefault();
    const currentPass = document.getElementById('currentPass').value;
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;

    if (newPass !== confirmPass) {
        alert('New passwords do not match!');
        return;
    }

    try {
        const settings = await getSupabaseSettings();
        if (settings?.password !== currentPass) {
            alert('Current password is incorrect!');
            return;
        }

        const { error } = await db.from('site_settings').update({
            password: newPass,
            updated_at: new Date().toISOString()
        }).eq('id', 'main');

        if (error) throw error;
        alert('Admin password updated in Supabase successfully!');
        event.target.reset();
    } catch (e) {
        console.error(e);
        alert('Failed to update password: ' + e.message);
    }
}
