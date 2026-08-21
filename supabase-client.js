/* ==========================================================================
   JK PHOTOGRAPHY STUDIO - SUPABASE CLIENT & CLOUD DATABASE ENGINE
   ========================================================================== */

const SUPABASE_URL = 'https://sqykcczogjshplkcwpzh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxeWtjY3pvZ2pzaHBsa2N3cHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyODU5ODUsImV4cCI6MjEwMjg2MTk4NX0.mYuSKufLAUnZNWK19E61xpQrT28zmqCrZB0Hg1bPClI';

// Initialize Supabase Client
let db = null;
if (window.supabase && typeof window.supabase.createClient === 'function') {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ---------------------------------------------------------------------------
// 1. FILE UPLOAD TO SUPABASE STORAGE ('jk-studio-assets' bucket)
// ---------------------------------------------------------------------------
async function uploadToSupabaseStorage(file, folder = 'uploads') {
    if (!db) throw new Error('Supabase client not initialized');
    if (!file) throw new Error('No file provided for upload');

    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filePath = `${folder}/${Date.now()}_${cleanFileName}`;

    const { data, error } = await db.storage
        .from('jk-studio-assets')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.error('Supabase upload error:', error);
        throw error;
    }

    const { data: publicData } = db.storage
        .from('jk-studio-assets')
        .getPublicUrl(filePath);

    return publicData.publicUrl;
}

// ---------------------------------------------------------------------------
// 2. DATA READ QUERIES (From Supabase PostgreSQL)
// ---------------------------------------------------------------------------
async function getSupabaseSettings() {
    if (!db) return null;
    const { data, error } = await db.from('site_settings').select('*').eq('id', 'main').single();
    if (error) { console.error('Error fetching settings:', error); return null; }
    return data;
}

async function getSupabaseHome() {
    if (!db) return null;
    const { data, error } = await db.from('home_content').select('*').eq('id', 'main').single();
    if (error) { console.error('Error fetching home content:', error); return null; }
    return data;
}

async function getSupabaseAbout() {
    if (!db) return null;
    const { data, error } = await db.from('about_content').select('*').eq('id', 'main').single();
    if (error) { console.error('Error fetching about content:', error); return null; }
    return data;
}

async function getSupabaseServices() {
    if (!db) return [];
    const { data, error } = await db.from('services').select('*').order('display_order', { ascending: true });
    if (error) { console.error('Error fetching services:', error); return []; }
    return data || [];
}

async function getSupabaseShootCategories() {
    if (!db) return [];
    const { data, error } = await db.from('shoot_categories').select('*').order('display_order', { ascending: true });
    if (error) { console.error('Error fetching shoot categories:', error); return []; }
    return data || [];
}

async function getSupabasePortfolio() {
    if (!db) return [];
    const { data, error } = await db.from('portfolio_items').select('*').order('display_order', { ascending: true });
    if (error) { console.error('Error fetching portfolio:', error); return []; }
    return data || [];
}

async function getSupabaseGifts() {
    if (!db) return [];
    const { data, error } = await db.from('gifts').select('*').order('display_order', { ascending: true });
    if (error) { console.error('Error fetching gifts:', error); return []; }
    return data || [];
}

async function getSupabasePackages() {
    if (!db) return [];
    const { data, error } = await db.from('packages').select('*').order('display_order', { ascending: true });
    if (error) { console.error('Error fetching packages:', error); return []; }
    return data || [];
}

async function getSupabaseBookings() {
    if (!db) return [];
    const { data, error } = await db.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching bookings:', error); return []; }
    return data || [];
}

// ---------------------------------------------------------------------------
// 3. BOOKING INSERTION (Direct to Supabase)
// ---------------------------------------------------------------------------
async function insertSupabaseBooking({ name, phone, email, service, event_date, message }) {
    if (!db) return false;
    const { data, error } = await db.from('bookings').insert([{
        name,
        phone,
        email: email || '',
        service,
        event_date: event_date || '',
        message: message || '',
        status: 'New'
    }]);

    if (error) {
        console.error('Error creating booking in Supabase:', error);
        return false;
    }
    return true;
}
