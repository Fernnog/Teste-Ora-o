import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { getFirestore, collection, doc, getDocs, query, where, getDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

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
let allTargets = [];
let filteredTargets = [];  // Alvos filtrados
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
        prayerTargets.push({ ...doc.data(), id: doc.id, status: 'Ativo' });
    });
}

async function fetchArchivedTargets(userId) {
    archivedTargets = [];
    const archivedRef = collection(db, "users", userId, "archivedTargets");
    const archivedSnapshot = await getDocs(archivedRef);
    archivedSnapshot.forEach((doc) => {
        archivedTargets.push({ ...doc.data(), id: doc.id, status: doc.data().resolved ? 'Respondido' : 'Arquivado' });
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
    allTargets = [...prayerTargets, ...archivedTargets];
}


function renderReport() {
    const reportList = document.getElementById('reportList');
    reportList.innerHTML = '';

    const searchTerm = currentSearchTermReport.toLowerCase();
    const filterAtivo = document.getElementById('filterAtivo').checked;
    const filterArquivado = document.getElementById('filterArquivado').checked;
    const filterRespondido = document.getElementById('filterRespondido').checked;

    // 1. FILTRAGEM (melhorada):
    filteredTargets = allTargets.filter(target => {
        // Filtro de texto (mantido)
        const textMatch = target.title.toLowerCase().includes(searchTerm) ||
                           target.details.toLowerCase().includes(searchTerm);

        // Filtro de status (mais eficiente)
        const statusMatches = (filterAtivo && target.status === 'Ativo') ||
                              (filterArquivado && target.status === 'Arquivado') ||
                              (filterRespondido && target.status === 'Respondido');

        return textMatch && statusMatches;
    });

    // 2. EXIBIÇÃO (com tratamento de dados faltantes):
    if (filteredTargets.length === 0) {
        reportList.innerHTML = '<p>Nenhum alvo encontrado.</p>';
        return;
    }

    filteredTargets.forEach(target => {
        // Obtenção dos dados de clique (com valores padrão):
        const targetClickData = clickCountsData[target.id] || { totalClicks: 0, monthlyClicks: {}, yearlyClicks: {} };
        const totalClicks = targetClickData.totalClicks || 0; // Total, com valor padrão 0

        const now = new Date();
        const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentYear = now.getFullYear().toString();

        // Acesso seguro aos dados mensais e anuais (com valores padrão):
        const monthlyClicks = (targetClickData.monthlyClicks && targetClickData.monthlyClicks[currentYearMonth]) || 0;
        const yearlyClicks = (targetClickData.yearlyClicks && targetClickData.yearlyClicks[currentYear]) || 0;

        const reportItemDiv = document.createElement('div');
        reportItemDiv.classList.add('report-item');
        reportItemDiv.innerHTML = `
            <h3>${target.title}</h3>
            <p><strong>Status:</strong> ${target.status}</p>
            <p><strong>Total de Orações:</strong> ${totalClicks}</p>
            <p><strong>Orações no Mês Corrente:</strong> ${monthlyClicks}</p>
            <p><strong>Orações no Ano Corrente:</strong> ${yearlyClicks}</p>
        `;
        reportList.appendChild(reportItemDiv);
    });
}



// Event listeners (mantidos e corrigidos)
document.getElementById('searchReport').addEventListener('input', (event) => {
    currentSearchTermReport = event.target.value;
    renderReport();
});

document.getElementById('filterAtivo').addEventListener('change', renderReport);
document.getElementById('filterArquivado').addEventListener('change', renderReport);
document.getElementById('filterRespondido').addEventListener('change', renderReport);

document.getElementById('backToMainButton').addEventListener('click', () => {
    window.location.href = 'index.html';
});

document.getElementById('viewAllTargetsButton').addEventListener('click', () => {
    window.location.href = 'index.html#mainPanel';
});

document.getElementById('viewArchivedButton').addEventListener('click', () => {
    window.location.href = 'index.html#archivedPanel';
});

document.getElementById('viewResolvedButton').addEventListener('click', () => {
    window.location.href = 'index.html#resolvedPanel';
});

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
