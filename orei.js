// ==== INÍCIO SEÇÃO - EVENT LISTENERS ====
// Autenticação
document.addEventListener('DOMContentLoaded', () => {
    const btnRegister = document.getElementById('btnRegister');
    const btnLogin = document.getElementById('btnLogin');
    const btnLogout = document.getElementById('btnLogout');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const btnForgotPassword = document.getElementById('btnForgotPassword');
    const passwordResetMessage = document.getElementById('passwordResetMessage');

    if (btnRegister) {
        btnRegister.addEventListener('click', async () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            if (!email || !password) { alert("Preencha email e senha para registrar."); return; }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                loadData(userCredential.user);
            } catch (error) {
                console.error("Erro no registro:", error);
                alert("Erro no registro: " + error.message);
            }
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', async () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            if (!email || !password) { alert("Preencha email e senha para entrar."); return;}
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                loadData(userCredential.user);
            } catch (error) {
                console.error("Erro no login:", error);
                alert("Erro no login: " + error.message);
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            try {
                await signOut(auth);
                loadData(null);
            } catch (error) {
                console.error("Erro ao sair:", error);
            }
        });
    }

    if (btnForgotPassword) {
        btnForgotPassword.addEventListener('click', async () => {
            const email = emailInput.value;
            if (!email) { alert("Por favor, insira seu email para redefinir a senha."); return; }
            try {
                await sendPasswordResetEmail(auth, email);
                passwordResetMessage.textContent = "Email de redefinição enviado. Verifique sua caixa de entrada (e spam).";
                passwordResetMessage.style.display = "block";
                setTimeout(() => { passwordResetMessage.style.display = "none"; }, 5000);
            } catch (error) {
                console.error("Erro ao enviar email de redefinição:", error);
                alert("Erro: " + error.message);
                passwordResetMessage.textContent = "Erro ao enviar email. Tente novamente.";
                passwordResetMessage.style.display = "block";
            }
        });
    }
});

//Navegação
document.getElementById('viewAllTargetsButton').addEventListener('click', () => {
    mainPanel.style.display = "block";
    dailySection.style.display = "none";  archivedPanel.style.display = "none";
    resolvedPanel.style.display = "none"; viewArchivedButton.style.display = "inline-block";
    viewResolvedButton.style.display = "inline-block"; backToMainButton.style.display = "inline-block";
    showDeadlineOnly = false; document.getElementById("showDeadlineOnly").checked = false;
    renderTargets();
});

const viewArchivedButton = document.getElementById("viewArchivedButton");
const viewResolvedButton = document.getElementById("viewResolvedButton");
const backToMainButton = document.getElementById("backToMainButton");
const mainPanel = document.getElementById("mainPanel");
const dailySection = document.getElementById("dailySection");
const archivedPanel = document.getElementById("archivedPanel");
const resolvedPanel = document.getElementById("resolvedPanel");

viewArchivedButton.addEventListener("click", () => {
    mainPanel.style.display = "none";  dailySection.style.display = "none";
    archivedPanel.style.display = "block"; resolvedPanel.style.display = "none";
    viewArchivedButton.style.display = "none"; viewResolvedButton.style.display = "inline-block";
    backToMainButton.style.display = "inline-block"; currentArchivedPage = 1;
    renderArchivedTargets();
});

viewResolvedButton.addEventListener("click", () => {
    mainPanel.style.display = "none"; dailySection.style.display = "none";
    archivedPanel.style.display = "none"; resolvedPanel.style.display = "block";
    viewArchivedButton.style.display = "inline-block"; viewResolvedButton.style.display = "none";
    backToMainButton.style.display = "inline-block"; currentResolvedPage = 1;
    renderResolvedTargets();
});

backToMainButton.addEventListener("click", () => {
    mainPanel.style.display = "none"; dailySection.style.display = "block";
    archivedPanel.style.display = "none"; resolvedPanel.style.display = "none";
    viewArchivedButton.style.display = "inline-block"; viewResolvedButton.style.display = "inline-block";
    backToMainButton.style.display = "none"; hideTargets();
    currentPage = 1;
});

document.getElementById("copyDaily").addEventListener("click", function () {
    const dailyTargetsElement = document.getElementById("dailyTargets");
    if (!dailyTargetsElement) { alert("Não foi possível encontrar os alvos diários."); return; }
    const dailyTargetsText = Array.from(dailyTargetsElement.children).map(div => {
        const title = div.querySelector('h3')?.textContent || '';
        const details = div.querySelector('p:nth-of-type(1)')?.textContent || '';
        const timeElapsed = div.querySelector('p:nth-of-type(2)')?.textContent || '';
        const observations = Array.from(div.querySelectorAll('p')).slice(2).map(p => p.textContent).join('\n');
        let result = `${title}\n${details}\n${timeElapsed}`;
        if (observations) result += `\nObservações:\n${observations}`;
        return result;
    }).join('\n\n---\n\n');
    navigator.clipboard.writeText(dailyTargetsText).then(() => {
        alert('Alvos diários copiados!');
    }, (err) => { console.error('Erro ao copiar texto: ', err); alert('Não foi possível copiar.'); });
});

document.getElementById('generateViewButton').addEventListener('click', generateViewHTML);
document.getElementById('viewDaily').addEventListener('click', generateDailyViewHTML);
document.getElementById("viewResolvedViewButton").addEventListener("click", () => {
    dateRangeModal.style.display = "block"; startDateInput.value = ''; endDateInput.value = '';
});

const dateRangeModal = document.getElementById("dateRangeModal");
const closeDateRangeModalButton = document.getElementById("closeDateRangeModal");
const generateResolvedViewButton = document.getElementById("generateResolvedView");
const cancelDateRangeButton = document.getElementById("cancelDateRange");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");

closeDateRangeModalButton.addEventListener("click", () => { dateRangeModal.style.display = "none"; });

generateResolvedViewButton.addEventListener("click", () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const today = new Date();
    const formattedToday = formatDateToISO(today);
    const adjustedEndDate = endDate || formattedToday;
    generateResolvedViewHTML(startDate, adjustedEndDate);
    dateRangeModal.style.display = "none";
});

cancelDateRangeButton.addEventListener("click", () => { dateRangeModal.style.display = "none"; });

// ==== BOTÃO "RELATÓRIO DE PERSEVERANÇA" - EVENT LISTENER ADICIONADO ====
document.getElementById("viewReportButton").addEventListener('click', () => {
    window.location.href = 'orei.html'; // Redireciona para a página de relatório
});
// ==== FIM SEÇÃO - EVENT LISTENERS ====
