// Admin credentials
const ADMIN_EMAIL = 'admin2012';
const ADMIN_PASSWORD = '2012asad';

// DOM Elements
const loginPage = document.getElementById('loginPage');
const adminLoginForm = document.getElementById('adminLoginForm');
const navLinks = document.querySelectorAll('.nav-links li');
const pages = document.querySelectorAll('.page');
const logoutBtn = document.getElementById('logoutBtn');
const totalUsersElement = document.getElementById('totalUsers');
const totalSongsElement = document.getElementById('totalSongs');

// Check authentication status
function checkAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    if (isAuthenticated) {
        loginPage.style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        updateDashboard();
    } else {
        loginPage.style.display = 'block';
        document.querySelectorAll('.page:not(#loginPage)').forEach(page => {
            page.style.display = 'none';
        });
    }
}

// Handle admin login
adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = adminLoginForm.querySelector('input[type="text"]').value;
    const password = adminLoginForm.querySelector('input[type="password"]').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        checkAuth();
    } else {
        alert('Invalid credentials!');
    }
});

// Handle navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const pageName = link.getAttribute('data-page');
        if (!pageName) return;

        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        pages.forEach(page => {
            page.style.display = page.id === pageName ? 'block' : 'none';
        });

        if (pageName === 'users') {
            populateUsersTable();
        } else if (pageName === 'songs') {
            populateSongsTable();
        }
    });
});

// Handle logout
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminAuthenticated');
    checkAuth();
});

// Update dashboard
function updateDashboard() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const songs = JSON.parse(localStorage.getItem('songs')) || [];

    totalUsersElement.textContent = users.length;
    totalSongsElement.textContent = songs.length;
}

// Populate users table
function populateUsersTable() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userTableBody = document.getElementById('userTableBody');
    
    userTableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.registrationDate || 'N/A'}</td>
            <td>
                <button onclick="deleteUser('${user.email}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Delete user
function deleteUser(email) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(user => user.email !== email);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        populateUsersTable();
        updateDashboard();
    }
}

// Handle song upload
const songUploadForm = document.getElementById('songUploadForm');
songUploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = songUploadForm.querySelector('input[type="text"]').value;
    const songFile = songUploadForm.querySelector('input[name="songFile"]').files[0];
    const imageFile = songUploadForm.querySelector('input[name="imageFile"]').files[0];

    // Convert files to base64
    const songReader = new FileReader();
    const imageReader = new FileReader();

    Promise.all([
        new Promise(resolve => {
            songReader.onload = e => resolve(e.target.result);
            songReader.readAsDataURL(songFile);
        }),
        new Promise(resolve => {
            imageReader.onload = e => resolve(e.target.result);
            imageReader.readAsDataURL(imageFile);
        })
    ]).then(([songUrl, imageUrl]) => {
        const songs = JSON.parse(localStorage.getItem('songs')) || [];
        const newSong = {
            id: Date.now(),
            title,
            songUrl,
            imageUrl,
            uploadDate: new Date().toISOString().split('T')[0]
        };
        
        songs.push(newSong);
        localStorage.setItem('songs', JSON.stringify(songs));
        
        alert('Song uploaded successfully!');
        songUploadForm.reset();
        populateSongsTable();
        updateDashboard();
    });
});

// Populate songs table
function populateSongsTable() {
    const songs = JSON.parse(localStorage.getItem('songs')) || [];
    const songTableBody = document.getElementById('songTableBody');
    
    songTableBody.innerHTML = songs.map(song => `
        <tr>
            <td><img src="${song.imageUrl}" alt="${song.title}" class="song-thumbnail"></td>
            <td>${song.title}</td>
            <td>${song.uploadDate}</td>
            <td>
                <button onclick="deleteSong(${song.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Delete song
function deleteSong(id) {
    if (confirm('Are you sure you want to delete this song?')) {
        const songs = JSON.parse(localStorage.getItem('songs')) || [];
        const updatedSongs = songs.filter(song => song.id !== id);
        localStorage.setItem('songs', JSON.stringify(updatedSongs));
        populateSongsTable();
        updateDashboard();
    }
}

// Initialize
checkAuth();
