document.addEventListener("DOMContentLoaded", function () {
    const apiBaseUrl = "http://localhost:3000/api/users";
    const userTableBody = document.getElementById("userTableBody");
    const userForm = document.getElementById("userForm");
    let editingUserId = null;
    let userIdToDelete = null; // Armazena o ID do usuário para exclusão

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

    // Carrega usuários
    async function loadUsers() {
        try {
            const response = await fetch(apiBaseUrl);
            if (response.ok) {
                const users = await response.json();
                renderUserTable(users);
            } else {
                showToast("Erro ao carregar usuários.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor: " + error.message, "red");
        }
    }

    // Renderiza a tabela de usuários
    function renderUserTable(users) {
        userTableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.nome}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="openEditModal(${user.id}, '${user.nome}', '${user.email}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="openDeleteModal(${user.id})">Excluir</button>
                </td>
            </tr>
        `).join('');
    }

    // Abre o modal para criar um novo usuário
    window.openCreateModal = function () {
        editingUserId = null;
        document.getElementById("userName").value = "";
        document.getElementById("userEmail").value = "";
        document.getElementById("userForm").reset();
        document.getElementById("userModalLabel").textContent = "Adicionar Usuário";
        document.getElementById("userPassword").required = true;
    };

    // Abre o modal para editar um usuário
    window.openEditModal = function (id, nome, email) {
        editingUserId = id;
        document.getElementById("userId").value = id;
        document.getElementById("userName").value = nome;
        document.getElementById("userEmail").value = email;
        document.getElementById("userPassword").required = false;
        document.getElementById("userModalLabel").textContent = "Editar Usuário";
        const userModal = new bootstrap.Modal(document.getElementById("userModal"));
        userModal.show();
    };

    // Salva ou edita o usuário
    userForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const id = editingUserId;
        const nome = document.getElementById("userName").value;
        const email = document.getElementById("userEmail").value;
        const senha = document.getElementById("userPassword").value;

        try {
            const response = await fetch(`${apiBaseUrl}${id ? `/${id}` : ""}`, {
                method: id ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome, email, ...(senha && { senha }) }),
            });

            if (response.ok) {
                showToast(id ? "Usuário atualizado com sucesso!" : "Usuário criado com sucesso!", "green");
                const userModal = bootstrap.Modal.getInstance(document.getElementById("userModal"));
                userModal.hide();
                loadUsers();
            } else {
                showToast("Erro ao salvar o usuário.", "red");
            }
        } catch (error) {
            showToast("Erro ao conectar com o servidor: " + error.message, "red");
        }
    });

  
      // Abre o modal para exclusão
      window.openDeleteModal = function (id) {
        userIdToDelete = id; // Armazena o ID do usuário a ser excluído
        confirmDeleteModal.show();
    };

    // Confirma a exclusão do usuário
    confirmDeleteButton.addEventListener("click", async function () {
        if (userIdToDelete) {
            try {
                const response = await fetch(`${apiBaseUrl}/${userIdToDelete}`, { method: "DELETE" });
                if (response.ok) {
                    showToast("Usuário excluído com sucesso!", "green");
                    confirmDeleteModal.hide();
                    loadUsers();
                } else {
                    showToast("Erro ao excluir o usuário.", "red");
                }
            } catch (error) {
                showToast("Erro ao conectar com o servidor: " + error.message, "red");
            } finally {
                userIdToDelete = null; // Reseta o ID após tentativa de exclusão
            }
        }
    });

    // Inicializa a página carregando os usuários
    loadUsers();
});

