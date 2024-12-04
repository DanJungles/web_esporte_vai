document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const apiUrl = "http://localhost:3000/api/users";
    const sportsApiUrl = "http://localhost:3000/api/sports";
    const sportsTableBody = document.getElementById("sportsTableBody");
    const manageSportsModal = new bootstrap.Modal(document.getElementById("manageSportsModal"));
    const addSportButton = document.getElementById("addSportButton");

        // Função para exibir notificações
        function showToast(message, backgroundColor) {
            Toastify({
                text: message,
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: backgroundColor,
                close: true,
            }).showToast();
        }

    // Carrega o perfil do usuário
    async function loadProfile() {
        try {
            const response = await fetch(`${apiUrl}/${userId}`);
            if (response.ok) {
                const user = await response.json();
                document.getElementById("nome").value = user.nome;
                document.getElementById("email").value = user.email;
              
            } else {
                showToast("Erro ao carregar o perfil.","red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor: " + error.message,"red");
        }
    }


   // Carrega esportes do usuário
   async function loadSports() {
    try {
        const response = await fetch(`${sportsApiUrl}/${userId}`);
        if (response.ok) {
            const sports = await response.json();
            renderSportsTable(sports);
        } else {
            sportsTableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Nenhum esporte encontrado.</td></tr>`;
            showToast("Erro ao carregar esportes.", "red");
        }
    } catch (error) {
        showToast("Erro ao conectar com o servidor.", "red");
    }
}

// Renderiza tabela de esportes
function renderSportsTable(sports) {
    if (sports.length === 0) {
        sportsTableBody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">Nenhum esporte encontrado.</td></tr>`;
        return;
    }

    sportsTableBody.innerHTML = sports.map(sport => `
        <tr>
            <td>${sport.esporte_nome}</td>
            <td>${sport.nivel_habilidade}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteSport(${sport.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Adicionar esporte
addSportButton.addEventListener("click", async function () {
    const sportName = document.getElementById("selectSport").value;
    const skillLevel = document.getElementById("selectSkillLevel").value;

    if (!sportName || !skillLevel) {
        showToast("Todos os campos são obrigatórios.", "red");
        return;
    }

    try {
        const response = await fetch(sportsApiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_usuario:userId, id_esporte: sportName, nivel_habilidade: skillLevel }),
        });

        if (response.ok) {
            showToast("Esporte adicionado com sucesso!", "green");
            loadSports();
        } else {
           const {error} = await response.json()
       
            showToast("Erro ao adicionar esporte: " + error, "red");
        }
    } catch (error) {
        showToast("Erro ao conectar com o servidor.", "red");
    }
});

// Excluir esporte
window.deleteSport = async function (id) {
    try {
        const response = await fetch(`${sportsApiUrl}/${id}`, { method: "DELETE" });
        if (response.ok) {
            showToast("Esporte excluído com sucesso!", "green");
            loadSports();
        } else {
            showToast("Erro ao excluir esporte.", "red");
        }
    } catch (error) {
        showToast("Erro ao conectar com o servidor.", "red");
    }
};



    // Inicializa os dados da página
    loadProfile();
    loadSports();
});
