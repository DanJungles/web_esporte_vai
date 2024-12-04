document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const apiBaseUrl = "http://localhost:3000/api/participations";
    const participationTableBody = document.getElementById("participationTableBody");
    let participationIdToDelete = null; // Armazena o ID da participação a ser excluída
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    const confirmDeleteButton = document.getElementById("confirmDeleteButton");

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

    // Carrega participações
    async function loadParticipations() {
        try {
            const response = await fetch(`${apiBaseUrl}/${userId}`);
            if (response.ok) {
                const participations = await response.json();
                renderParticipationTable(participations);
            } else {
                showToast("Nenhum participação encontrada.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor: " + error.message, "red");
        }
    }

    // Renderiza a tabela de participações
    function renderParticipationTable(participations) {
        participationTableBody.innerHTML = participations.map(participation => `
            <tr>
                <td>${participation.evento_nome}</td>
                <td>${participation.data}</td>
                 <td>${participation.horario}</td>
                <td>${participation.local}</td>
                <td>${participation.numero_participantes}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${participation.participacao_id})">Cancelar</button>
                </td>
            </tr>
        `).join('');
    }

    // Abre o modal para exclusão
    window.openDeleteModal = function (id) {
        participationIdToDelete = id; // Armazena o ID da participação a ser excluída
        confirmDeleteModal.show();
    };

    // Confirma a exclusão da participação
    confirmDeleteButton.addEventListener("click", async function () {
        if (participationIdToDelete) {
            try {
                const response = await fetch(`${apiBaseUrl}/${participationIdToDelete}`, { method: "DELETE" });
                if (response.ok) {
                    showToast("Participação excluída com sucesso!", "green");
                    confirmDeleteModal.hide();

                    location.reload();
                } else {
                    showToast("Erro ao excluir a participação.", "red");
                }
            } catch (error) {
                showToast("Erro ao conectar com o servidor: " + error.message, "red");
            } finally {
                participationIdToDelete = null; // Limpa o ID após a tentativa de exclusão
            }
        }
    });

  
    // Inicializa a página carregando as participações
    loadParticipations();
});
