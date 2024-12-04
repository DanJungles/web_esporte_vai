document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const apiUrl = "http://localhost:3000/api/events";
    const myEventsTableBody = document.getElementById("myEventsTableBody");
    const eventForm = document.getElementById("eventForm");
    const eventModal = new bootstrap.Modal(document.getElementById("eventModal"));
    const confirmDeleteModal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
    let eventIdToDelete = null; // Armazena o ID do evento a ser excluído
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

    // Carrega eventos do organizador
    async function loadMyEvents() {
        try {
            const response = await fetch(`${apiUrl}/organizer/${userId}`);
            if (response.ok) {
                const events = await response.json();
                renderEventsTable(events);
            } else {
                myEventsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum evento encontrado.</td></tr>`;
                showToast("Erro ao carregar eventos.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor: " + error.message, "red");
        }
    }

    // Renderiza tabela de eventos
    function renderEventsTable(events) {
        if (events.length === 0) {
            myEventsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum evento encontrado.</td></tr>`;
            return;
        }

        myEventsTableBody.innerHTML = events.map(event => `
            <tr>
                <td>${event.nome}</td>
                <td>${event.esporte}</td>
                <td>${event.data}</td>
                <td>${event.local}</td>
                <td>${event.numero_participantes}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editEvent(${event.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${event.id})">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    // Abre o modal de exclusão
    window.openDeleteModal = function (id) {
        eventIdToDelete = id; // Armazena o ID do evento a ser excluído
        confirmDeleteModal.show();
    };

    // Confirma a exclusão do evento
    confirmDeleteButton.addEventListener("click", async function () {
        if (eventIdToDelete) {
            try {
                const response = await fetch(`${apiUrl}/${eventIdToDelete}`, { method: "DELETE" });
                if (response.ok) {
                    showToast("Evento excluído com sucesso!", "green");
                    confirmDeleteModal.hide();
                    loadMyEvents();
                } else {
                    showToast("Erro ao excluir evento.", "red");
                }
            } catch (error) {
                showToast("Erro ao conectar com o servidor: " + error.message, "red");
            } finally {
                eventIdToDelete = null; // Reseta o ID após a tentativa de exclusão
            }
        }
    });

    // Editar evento
    window.editEvent = async function (eventId) {
        try {
            const response = await fetch(`${apiUrl}/byID/${eventId}`);
            if (response.ok) {
                const event = await response.json();
                document.getElementById("eventId").value = event.id;
                document.getElementById("eventName").value = event.nome;
                document.getElementById("eventSport").value = event.id_esporte;
                document.getElementById("eventDate").value = event.data;
                document.getElementById("eventTime").value = event.horario;
                document.getElementById("eventLocation").value = event.local;
                document.getElementById("eventParticipants").value = event.max_participantes;
                document.getElementById("eventSkillLevel").value = event.nivel_habilidade;

                document.getElementById("eventModalLabel").textContent = "Editar Evento";
                eventModal.show();
            } else {
                showToast("Erro ao carregar dados do evento.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor.", "red");
        }
    };

    // Salvar evento (criar ou editar)
    eventForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const eventId = document.getElementById("eventId").value;
        const eventName = document.getElementById("eventName").value;
        const eventSport = document.getElementById("eventSport").value;
        const eventDate = document.getElementById("eventDate").value;
        const eventTime = document.getElementById("eventTime").value;
        const eventLocation = document.getElementById("eventLocation").value;
        const eventParticipants = document.getElementById("eventParticipants").value;
        const eventSkillLevel = document.getElementById("eventSkillLevel").value;

        const method = eventId ? "PUT" : "POST";
        const url = eventId ? `${apiUrl}/${eventId}` : `${apiUrl}/organizer/${userId}`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: eventName,
                    id_esporte: eventSport,
                    id_organizador: userId,
                    data: eventDate,
                    horario: eventTime,
                    local: eventLocation,
                    max_participantes: eventParticipants,
                    nivel_habilidade: eventSkillLevel,
                }),
            });

            if (response.ok) {
                showToast(eventId ? "Evento atualizado com sucesso!" : "Evento criado com sucesso!", "green");
                eventForm.reset();
                eventModal.hide();
                loadMyEvents();
            } else {
                showToast("Erro ao salvar evento.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor.", "red");
        }
    });

    // Inicializa os dados
    loadMyEvents();
});
