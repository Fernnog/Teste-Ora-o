import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, collection, doc, getDocs, query, where, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// Importe firebaseConfig do seu script principal (script.js) ou defina aqui novamente
const firebaseConfig = {
    apiKey: "AIzaSyDUbWB7F_4-tQ8K799wylf36IayGWgBuMU",
    authDomain: "diario-de-oracao-268d3.firebaseapp.com",
    projectId: "diario-de-oracao-268d3",
    storageBucket: "diario-de-oracao-268d3.firebasestorage.app",
    messagingSenderId: "561592831701",
    appId: "1:561592831701:web:2a682317486837fd795c5c",
    measurementId: "G-15YHNK7H2B"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

let prayerTargets = [];
let archivedTargets = [];
let clickCountsData = {};
let currentUserId = null;
let allTargets = []; // Para armazenar todos os alvos (ativos e arquivados)
let filteredTargets = []; // Para alvos filtrados pela busca
let currentSearchTermReport = '';


async function loadReportData(userId) {
    currentUserId = userId;
    await fetchPrayerTargets(userId);
    await fetchArchivedTargets(userId);
    await fetchClickCounts(userId);
    mergeTargetsAndClicks();
    renderReport();
}

async function fetchPrayerTargets(userId) {
    prayerTargets = [];
    const targetsRef = collection(db, "users", userId, "prayerTargets");
    const targetsSnapshot = await getDocs(targetsRef);
    targetsSnapshot.forEach((doc) => {
        prayerTargets.push({...doc.data(), id: doc.id, status: 'Ativo'}); // Adiciona status
    });
}

async function fetchArchivedTargets(userId) {
    archivedTargets = [];
    const archivedRef = collection(db, "users", userId, "archivedTargets");
    const archivedSnapshot = await getDocs(archivedRef);
    archivedSnapshot.forEach((doc) => {
        archivedTargets.push({...doc.data(), id: doc.id, status: doc.data().resolved ? 'Respondido' : 'Arquivado'}); // Adiciona status
    });
}


async function fetchClickCounts(userId) {
    clickCountsData = {};
    const clickCountsRef = collection(db, "prayerClickCounts");
    const q = query(clickCountsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
        clickCountsData[doc.data().targetId] = doc.data();
    });
}

function mergeTargetsAndClicks() {
    allTargets = [...prayerTargets, ...archivedTargets]; // Combina alvos ativos e arquivados
    filteredTargets = allTargets; // Inicialmente, todos os alvos são exibidos
}


function renderReport() {
    const reportList = document.getElementById('reportList');
    reportList.innerHTML = ''; // Limpa a lista antes de renderizar

    // Filtra os alvos com base no termo de pesquisa
    const searchTerm = currentSearchTermReport.toLowerCase();
    const targetsToDisplay = filteredTargets.filter(target => {
        return target.title.toLowerCase().includes(searchTerm) || target.details.toLowerCase().includes(searchTerm);
    });

    if (targetsToDisplay.length === 0) {
        reportList.innerHTML = '<p>Nenhum alvo encontrado.</p>';
        return;
    }


    targetsToDisplay.forEach(target => {
        const targetClickData = clickCountsData[target.id] || { totalClicks: 0 }; // Obtém dados de cliques ou usa 0 se não houver
        const reportItemDiv = document.createElement('div');
        reportItemDiv.classList.add('report-item');
        reportItemDiv.innerHTML = `
            <h3>${target.title}</h3>
            <p><strong>Status:</strong> ${target.status}</p>
            <p><strong>Total de Orações:</strong> ${targetClickData.totalClicks}</p>
            <p><strong>Cliques Mensais:</strong> ${formatMonthlyClicks(targetClickData.monthlyClicks)}</p>
            <p><strong>Cliques Anuais:</strong> ${formatYearlyClicks(targetClickData.yearlyClicks)}</p>
        `;
        reportList.appendChild(reportItemDiv);
    });
}

function formatMonthlyClicks(monthlyClicks) {
    if (!monthlyClicks) return 'N/A';
    return Object.entries(monthlyClicks)
                 .map(([monthYear, count]) => `${monthYear}: ${count}`)
                 .join(', ');
}

function formatYearlyClicks(yearlyClicks) {
     if (!yearlyClicks) return 'N/A';
    return Object.entries(yearlyClicks)
                 .map(([year, count]) => `${year}: ${count}`)
                 .join(', ');
}

document.getElementById('searchReport').addEventListener('input', (event) => {
    currentSearchTermReport = event.target.value;
    renderReport();
});

// ==== INÍCIO SEÇÃO - EVENT LISTENERS DE NAVEGAÇÃO (MENU) ====
document.getElementById('backToMainButton').addEventListener('click', () => {
    window.location.href = 'index.html'; // Volta para a página principal
});

document.getElementById('viewAllTargetsButton').addEventListener('click', () => {
    window.location.href = 'index.html#mainPanel'; // Vai para a seção de alvos principais
});

document.getElementById('viewArchivedButton').addEventListener('click', () => {
    window.location.href = 'index.html#archivedPanel'; // Vai para a seção de arquivados
});

document.getElementById('viewResolvedButton').addEventListener('click', () => {
    window.location.href = 'index.html#resolvedPanel'; // Vai para a seção de resolvidos
});
// ==== FIM SEÇÃO - EVENT LISTENERS DE NAVEGAÇÃO (MENU) ====


window.onload = () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadReportData(user.uid);
        } else {
            alert("Usuário não autenticado. Redirecionando para a página principal.");
            window.location.href = 'index.html';
        }
    });
};
