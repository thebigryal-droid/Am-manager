/* =========================================================
   RYAL OS - CORE LOGIC (PHASE 2)
   ========================================================= */

// 1. Navigation Configuration
const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
    { id: 'amenities', label: 'Amenity Master', icon: 'fa-building' },
    { id: 'control', label: 'Daily Checklist', icon: 'fa-check-double' },
    { id: 'hk_schedule', label: 'HK Schedule', icon: 'fa-broom' },
    { id: 'staff_master', label: 'Staff Master', icon: 'fa-users' },
    { id: 'attendance', label: 'Staff Attendance', icon: 'fa-user-clock' },
    { id: 'pool', label: 'Pool Logs', icon: 'fa-swimming-pool' },
    { id: 'maintenance', label: 'Maintenance', icon: 'fa-tools' },
    { id: 'inventory', label: 'Inventory', icon: 'fa-boxes' },
    { id: 'issues', label: 'Complaints Log', icon: 'fa-exclamation-circle' },
    { id: 'bookings', label: 'Bookings', icon: 'fa-calendar-alt' }
];

// 2. Initialize App
document.addEventListener('DOMContentLoaded', () => {
    buildNavigation();
    
    // Auto-create blank sections for tabs that don't exist in HTML yet
    menuItems.forEach(item => {
        if (!document.getElementById(`tab-${item.id}`)) {
            const main = document.querySelector('main');
            main.insertAdjacentHTML('beforeend', `
                <section id="tab-${item.id}" class="tab-content">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center mt-4">
                        <i class="fas ${item.icon} text-4xl text-gray-300 mb-3"></i>
                        <h3 class="text-xl font-bold">${item.label}</h3>
                        <p class="text-gray-500 mt-2">Module under construction.</p>
                    </div>
                </section>
            `);
        }
    });
});

// 3. Build Sidebar Navigation
function buildNavigation() {
    const navMenu = document.getElementById('nav-menu');
    navMenu.innerHTML = menuItems.map(item => `
        <button 
            onclick="switchTab('${item.id}', '${item.label}')" 
            id="nav-btn-${item.id}"
            class="nav-btn w-full flex items-center text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-secondary hover:text-white transition-colors">
            <i class="fas ${item.icon} w-6 text-center mr-2"></i>
            <span class="font-medium">${item.label}</span>
        </button>
    `).join('');
    
    // Highlight default tab
    document.getElementById('nav-btn-dashboard').classList.add('bg-accent', 'text-white');
    document.getElementById('nav-btn-dashboard').classList.remove('text-gray-300', 'hover:bg-secondary');
}

// 4. Tab Switching Logic
function switchTab(tabId, tabLabel) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`tab-${tabId}`);
    if (selectedTab) selectedTab.classList.add('active');
    
    // Update Header Title
    document.getElementById('current-page-title').innerText = tabLabel;
    
    // Update Nav Button Styles
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-accent', 'text-white');
        btn.classList.add('text-gray-300', 'hover:bg-secondary');
    });
    
    const activeBtn = document.getElementById(`nav-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-300', 'hover:bg-secondary');
        activeBtn.classList.add('bg-accent', 'text-white');
    }

    // Close sidebar on mobile after clicking
    if (window.innerWidth < 768) {
        toggleSidebar();
    }
}

// 5. Mobile Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.toggle('-translate-x-full');
    overlay.classList.toggle('hidden');
}

// 6. Floor Plan Switcher (Preserved logic)
function changeFloorPlan(planId) {
    document.querySelectorAll('.floor-plan-view').forEach(view => {
        view.classList.remove('block');
        view.classList.add('hidden');
    });
    
    const selectedPlan = document.getElementById(planId);
    if(selectedPlan) {
        selectedPlan.classList.remove('hidden');
        selectedPlan.classList.add('block');
    }
}
