
document.addEventListener("DOMContentLoaded", function () {
    const userId = localStorage.getItem("userId");
    const apiBaseUrl = "http://localhost:3000/api";
    const createEventForm = document.getElementById("createEventForm");
    const eventListTableBody = document.getElementById("eventListTableBody");
    const apiUrl = `http://localhost:3000/api/events/${userId}`;

    // Função para carregar eventos de uma API específica
    async function loadEvents(endpoint, containerId) {
        try {
            const response = await fetch(`${apiBaseUrl}/${endpoint}`);
            const container = document.getElementById(containerId);

            if (response.ok) {
                const events = await response.json();
                if (events.length === 0) {
                    container.innerHTML = `<p class="text-muted">Nenhum evento disponível.</p>`;
                    return;
                }

                container.innerHTML = events.map(event => `
                    <div class="d-flex mb-3 align-items-center">
                        <div class="flex-grow-1">
                            <h5>${event.data}</h5>
                              <h6>Nome: ${event.nome}</h6>
                            <p class="mb-0 text-muted">Modalidade: ${event.esporte_nome} | Nível: ${event.nivel_habilidade}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = `<p class="text-danger">Erro ao carregar eventos.</p>`;
                showToast("Nenhum evento encontrado.", "red");
            }
        } catch (error) {
            const container = document.getElementById(containerId);
            container.innerHTML = `<p class="text-danger">Erro ao conectar: ${error.message}</p>`;
            showToast(`Erro ao conectar: ${error.message}`, "red");
        }
    }

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

    // Envia os dados do evento para a API
    createEventForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const eventName = document.getElementById("eventName").value;
        const eventSport = document.getElementById("eventSport").value;
        const eventDate = document.getElementById("eventDate").value;
        const eventTime = document.getElementById("eventTime").value;
        const eventLocation = document.getElementById("eventLocation").value;
        const eventParticipants = document.getElementById("eventParticipants").value;
        const eventSkillLevel = document.getElementById("eventSkillLevel").value;

        try {
            const response = await fetch( `${apiBaseUrl}/events/organizer/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_organizador: userId,
                    nome: eventName,
                    id_esporte: eventSport,
                    data: eventDate,
                    horario: eventTime,
                    local: eventLocation,
                    max_participantes: eventParticipants,
                    nivel_habilidade: eventSkillLevel,
                }),
            });

            if (response.ok) {
                showToast("Evento criado com sucesso!", "green");
                createEventForm.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById("createEventModal"));
                modal.hide();
                loadEventsModal();
                location.reload();
            } else {
                showToast("Erro ao criar evento.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor.", "red");
        }
    });

    // Carrega eventos para o modal
    async function loadEventsModal() {
        try {
            const response = await fetch(apiUrl);
            if (response.ok) {
                const events = await response.json();
                renderEventList(events);
            } else {
                eventListTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum evento encontrado.</td></tr>`;
               // showToast("Nenhum Evento encontrado.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor.", "red");
        }
    }

    // Renderiza a lista de eventos
    function renderEventList(events) {
        if (events.length === 0) {
            eventListTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Nenhum evento encontrado.</td></tr>`;
            return;
        }

        eventListTableBody.innerHTML = events.map(event => `
            <tr>
                <td>${event.nome}</td>
                <td>${event.esporte}</td>
                <td>${event.data}</td>
                <td>${event.local}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="participateInEvent(${event.id})">Participar</button>
                </td>
            </tr>
        `).join('');
    }

    // Participar em um evento
    window.participateInEvent = async function (eventId) {
        try {
            const response = await fetch(`${apiBaseUrl}/events/${eventId}/participate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: userId,
                }),
            });

            if (response.ok) {
                showToast("Participação confirmada!", "green");
                loadEventsModal();
                location.reload();
            } else {
                showToast("Erro ao participar do evento.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor.", "red");
        }
    };

    loadEventsModal();
    loadEvents(`users/${userId}/upcoming-events`, "upcomingEvents");
    loadEvents(`users/${userId}/subscribed-events`, "subscribedEvents");
    loadEvents(`users/${userId}/past-events`, "pastEvents");
});

