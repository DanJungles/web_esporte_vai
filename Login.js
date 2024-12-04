 document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          senha: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Exibir notificação de sucesso
        Toastify({
          text: "Login realizado com sucesso!",
          duration: 1000,
          gravity: "top", // Posição: "top" ou "bottom"
          position: "right", // Alinhamento: "left", "center" ou "right"
          backgroundColor: "green",
          close: true, // Mostra o botão para fechar
        }).showToast();

        // Salvar o token no localStorage ou redirecionar o usuário
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.user.id);
        setTimeout(() => {
          window.location.href = "dashboard.html"; // Exemplo de redirecionamento
        }, 1000);
      } else {
        const error = await response.json();

        // Exibir notificação de erro
        Toastify({
          text: "Erro: " + (error.message || "Falha no login"),
          duration: 1000,
          gravity: "top",
          position: "right",
          backgroundColor: "red",
          close: true,
        }).showToast();
      }
    } catch (error) {
      // Exibir notificação de erro de conexão
      Toastify({
        text: "Erro ao conectar com o servidor: " + error.message,
        duration: 1000,
        gravity: "top",
        position: "right",
        backgroundColor: "red",
        close: true,
      }).showToast();
    }
  });
