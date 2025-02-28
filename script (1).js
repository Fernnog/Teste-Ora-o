--- START OF FILE Diario-de-Oracao-main/script.js ---
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get references to HTML elements
const authForm = document.getElementById('authForm');
const userInfo = document.getElementById('userInfo');
const userNameDisplay = document.getElementById('userName');
const authStatusDisplay = document.getElementById('authStatus'); // You might not need to show this anymore
const btnLogout = document.getElementById('btnLogout');

const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passwordResetMessage = document.getElementById('passwordResetMessage');
const btnForgotPassword = document.getElementById('btnForgotPassword');

const appContent = document.getElementById('appContent');
const mainMenu = document.getElementById('mainMenu');
const dailySection = document.getElementById('dailySection');
const mainPanel = document.getElementById('mainPanel');
const archivedPanel = document.getElementById('archivedPanel');
const resolvedPanel = document.getElementById('resolvedPanel');
const deadlinePanel = document.getElementById('deadlinePanel');
const sectionSeparator = document.getElementById('sectionSeparator');


// Function to update the UI based on authentication state
function updateAuthUI(user) {
    if (user) {
        // User is logged in
        authForm.style.display = 'none'; // Hide the login form
        userInfo.style.display = 'block'; // Show user info section
        userNameDisplay.textContent = `Usuário autenticado: ${user.email}`; // Display logged-in email
        authStatusDisplay.style.display = 'none'; // Hide the general auth status message if you are using it.
        passwordResetMessage.style.display = 'none'; // Ensure password reset message is hidden

        // Show main application content
        appContent.style.display = 'block';
        mainMenu.style.display = 'block';
        dailySection.style.display = 'block';
        mainPanel.style.display = 'block';
        sectionSeparator.style.display = 'block';

    } else {
        // User is logged out
        authForm.style.display = 'block'; // Show the login form
        userInfo.style.display = 'none'; // Hide user info section
        authStatusDisplay.style.display = 'none'; //  Hide the general auth status message.
        userNameDisplay.textContent = ''; // Clear user name display
        passwordResetMessage.style.display = 'none'; // Ensure password reset message is hidden

        // Hide main application content
        appContent.style.display = 'none';
        mainMenu.style.display = 'none';
        dailySection.style.display = 'none';
        mainPanel.style.display = 'none';
        archivedPanel.style.display = 'none';
        resolvedPanel.style.display = 'none';
        deadlinePanel.style.display = 'none';
        sectionSeparator.style.display = 'none';
    }
}

// Check authentication state on page load
onAuthStateChanged(auth, (user) => {
    updateAuthUI(user);
});


// --- Login Function ---
btnLogin.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        updateAuthUI(user); // Update UI after successful login
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        authStatusDisplay.style.display = 'block'; // Show error message if needed
        authStatusDisplay.textContent = `Erro de autenticação: ${error.message}`;
    }
});


// --- Register Function ---
btnRegister.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        updateAuthUI(user); // Update UI after successful registration
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        authStatusDisplay.style.display = 'block'; // Show error message if needed
        authStatusDisplay.textContent = `Erro de registro: ${error.message}`;
    }
});


// --- Logout Function ---
btnLogout.addEventListener('click', async () => {
    try {
        await signOut(auth);
        updateAuthUI(null); // Update UI after logout (user is null)
        authStatusDisplay.style.display = 'block'; // Optionally show "logged out" message
        authStatusDisplay.textContent = 'Usuário desconectado.';
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        authStatusDisplay.style.display = 'block'; // Show error message if needed
        authStatusDisplay.textContent = `Erro ao desconectar: ${error.message}`;
    }
});

// --- Forgot Password Function ---
btnForgotPassword.addEventListener('click', async () => {
    const email = emailInput.value;
    if (email) {
        try {
            await sendPasswordResetEmail(auth, email);
            passwordResetMessage.style.display = 'block';
            passwordResetMessage.textContent = 'Email de redefinição de senha enviado! Verifique sua caixa de entrada (e spam).';
            authStatusDisplay.style.display = 'none'; // Hide general status messages
        } catch (error) {
            console.error("Erro ao enviar email de redefinição de senha:", error);
            passwordResetMessage.style.display = 'block';
            passwordResetMessage.textContent = `Erro ao redefinir senha: ${error.message}`;
            passwordResetMessage.style.color = 'red'; // Style error message in red
            authStatusDisplay.style.display = 'none'; // Hide general status messages
        }
    } else {
        passwordResetMessage.style.display = 'block';
        passwordResetMessage.textContent = 'Por favor, insira seu email para redefinir a senha.';
    }
});

// ---  Example: Placeholder functions for other buttons (Implement your logic) ---
document.getElementById('backToMainButton').addEventListener('click', () => {
    alert('Implementar: Voltar para a Página Inicial');
    // Implement your logic here to show the main view, if different from default
    // For example, ensure mainPanel, dailySection are visible and others are hidden if needed.
    appContent.style.display = 'block';
    dailySection.style.display = 'block';
    mainPanel.style.display = 'block';
    archivedPanel.style.display = 'none';
    resolvedPanel.style.display = 'none';
    deadlinePanel.style.display = 'none';
});

document.getElementById('viewAllTargetsButton').addEventListener('click', () => {
    alert('Implementar: Ver Todos os Alvos');
    // Implement your logic to display all targets in the main panel
    mainPanel.style.display = 'block';
    archivedPanel.style.display = 'none';
    resolvedPanel.style.display = 'none';
    deadlinePanel.style.display = 'none';
});

document.getElementById('viewArchivedButton').addEventListener('click', () => {
    alert('Implementar: Ver Arquivados');
    // Implement your logic to display archived targets in the archived panel
    mainPanel.style.display = 'none';
    archivedPanel.style.display = 'block';
    resolvedPanel.style.display = 'none';
    deadlinePanel.style.display = 'none';
});

document.getElementById('viewResolvedButton').addEventListener('click', () => {
    alert('Implementar: Ver Respondidos');
    // Implement your logic to display resolved targets in the resolved panel
    mainPanel.style.display = 'none';
    archivedPanel.style.display = 'none';
    resolvedPanel.style.display = 'block';
    deadlinePanel.style.display = 'none';
});

document.getElementById('generateViewButton').addEventListener('click', () => {
    alert('Implementar: Gerar Visualização Geral');
    // Implement your logic to generate and display the general view
});

document.getElementById('viewResolvedViewButton').addEventListener('click', () => {
    alert('Implementar: Visualizar Respondidos (com seleção de período)');
    // Implement your logic to show the date range modal and handle resolved view
});

document.getElementById('prayerForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    alert('Implementar: Adicionar Alvo de Oração');
    // Implement your logic to handle form submission and add prayer target
    // You'll likely need to get form values and save them to Firebase or your backend
});

document.getElementById('refreshDaily').addEventListener('click', () => {
    alert('Implementar: Atualizar Alvos do Dia');
    // Implement logic to refresh daily targets
});

document.getElementById('copyDaily').addEventListener('click', () => {
    alert('Implementar: Copiar Alvos do Dia');
    // Implement logic to copy daily targets to clipboard or display for copying
});

document.getElementById('viewDaily').addEventListener('click', () => {
    alert('Implementar: Visualizar Alvos do Dia');
    // Implement logic to view daily targets in a different format or section if needed
});

document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('completionPopup').style.display = 'none';
});

// --- Example for handling deadline checkbox and date display ---
const hasDeadlineCheckbox = document.getElementById('hasDeadline');
const deadlineContainer = document.getElementById('deadlineContainer');

hasDeadlineCheckbox.addEventListener('change', function() {
    if (this.checked) {
        deadlineContainer.style.display = 'block';
    } else {
        deadlineContainer.style.display = 'none';
    }
});