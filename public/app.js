// ======================
// SOCKET.IO
// ======================

const socket = io();

// ======================
// ЭЛЕМЕНТЫ
// ======================

const loginPage = document.getElementById("loginPage");
const homePage = document.getElementById("homePage");
const chatPage = document.getElementById("chatPage");

const actionsModal = document.getElementById("actionsModal");
const searchModal = document.getElementById("searchModal");
const roomSelectorModal =
    document.getElementById(
        "roomSelectorModal"
    );
const messageModal = document.getElementById("messageModal");
const profileModal = document.getElementById("profileModal");
const closeChatModal = document.getElementById("closeChatModal");

const usernameInput = document.getElementById("usernameInput");
const profileUsername = document.getElementById("profileUsername");
const avatar = document.getElementById("avatar");

const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

const messagesContainer = document.getElementById("messagesContainer");
const toast = document.getElementById("errorToast");

const adminButton =
    document.getElementById(
        "adminButton"
    );

const adminPanel =
    document.getElementById(
        "adminPanel"
    );

const adminUsersList =
    document.getElementById(
        "adminUsersList"
    );
    
const adminUserModal =
    document.getElementById(
        "adminUserModal"
    );

const adminModalUsername =
    document.getElementById(
        "adminModalUsername"
    );

const warnModal =
    document.getElementById(
        "warnModal"
    );

const warnText =
    document.getElementById(
        "warnText"
    );
// ======================
// ПОДДЕРЖКА
// ======================

const supportPage =
    document.getElementById(
        "supportPage"
    );

const supportMessages =
    document.getElementById(
        "supportMessages"
    );

const supportInput =
    document.getElementById(
        "supportInput"
    );

const supportBadge =
    document.getElementById(
        "supportBadge"
    );

const supportListPage =
    document.getElementById(
        "supportListPage"
    );

const supportList =
    document.getElementById(
        "supportList"
    );

const adminSupportPage =
    document.getElementById(
        "adminSupportPage"
    );

const adminSupportMessages =
    document.getElementById(
        "adminSupportMessages"
    );

const adminSupportInput =
    document.getElementById(
        "adminSupportInput"
    );

const adminSupportUser =
    document.getElementById(
        "adminSupportUser"
    );

const adminCloseModal =
    document.getElementById(
        "adminCloseModal"
    );

// ======================
// ДАННЫЕ
// ======================

let currentUser = null;
let selectedAdminUser = null;
let roomSize = 2;
let loggedIn = false;
let supportOpened = false;

let currentSupportUser = null;

const ADMIN_USERNAME =
    "@ChatAdmin";


// ======================
// LOGIN
// ======================

function login() {

    const username =
        usernameInput.value.trim();

    if (!username) {

        showToast(
            "Введите username"
        );

        return;
    }

    if (loggedIn) return;

    currentUser =
        username.startsWith("@")
        ? username
        : "@" + username;

    localStorage.setItem(
        "username",
        currentUser
    );

    profileUsername.textContent =
        currentUser;

    avatar.textContent =
        currentUser
        .replace("@", "")
        .charAt(0)
        .toUpperCase();

    loggedIn = true;

    socket.emit(
        "login",
        currentUser
    );

    // показать кнопку админа
    if (
        currentUser ===
        "@ChatAdmin"
    ) {

        adminButton.classList.remove(
            "hidden"
        );

    }

}
socket.once(
    "loginSuccess",
    () => {

        loginPage.classList.add(
            "hidden"
        );

        homePage.classList.remove(
            "hidden"
        );

    }
);

// ======================
// ЗАГРУЗКА СЕССИИ
// ======================

window.addEventListener("load", () => {

    const saved =
        localStorage.getItem(
            "username"
        );

    if (saved) {

        currentUser = saved;
        if (
    currentUser ===
    ADMIN_USERNAME
) {

    adminButton.classList.remove(
        "hidden"
    );

}
        loggedIn = true;

        profileUsername.textContent =
            saved;

        avatar.textContent =
            saved
                .replace("@", "")
                .charAt(0)
                .toUpperCase();

        loginPage.classList.add(
            "hidden"
        );

        homePage.classList.remove(
            "hidden"
        );

        socket.emit(
            "login",
            currentUser
        );

    }

});

// ======================
// ПОИСК СОБЕСЕДНИКА
// ======================

function startSearch(size) {

    roomSize = size;

    roomSelectorModal.classList.add(
        "hidden"
    );

    searchModal.classList.remove(
        "hidden"
    );

    const searchCount =
        document.getElementById(
            "searchCount"
        );

    searchCount.textContent =
        `Найдено: 1/${size}`;

    socket.emit(
        "findPartner",
        size
    );

}

function cancelSearch() {

    searchModal.classList.add("hidden");

    socket.emit("leaveChat");
}

socket.on(
    "searchCount",
    (data) => {

        const searchCount =
            document.getElementById(
                "searchCount"
            );

        if (searchCount) {

            searchCount.textContent =
                `Найдено: ${data.found}/${data.total}`;

        }

    }
);

// ======================
// ЧАТ НАЧАЛСЯ
// ======================

socket.on("chatStarted", () => {

    searchModal.classList.add("hidden");

    openChat();

});

// ======================
// ОТКРЫТЬ ЧАТ
// ======================

function openChat() {

    chatMessages.innerHTML = "";

    chatPage.classList.remove("hidden");

    addSystemMessage("Собеседник найден 👤");
}

// ======================
// СООБЩЕНИЯ В ЧАТЕ
// ======================

function sendMessage() {

    const text = chatInput.value.trim();

    if (!text) return;

    addMyMessage(text);

    socket.emit("chatMessage", text);

    chatInput.value = "";
}

// пришло сообщение
socket.on(
    "chatMessage",
    (data) => {

        addPartnerMessage(
            data.text,
            data.participant
        );

    }
);

// чат закрыт
socket.on("chatClosed", () => {

    chatPage.classList.add("hidden");

    showToast("Чат завершён");

});

// ======================
// UI СООБЩЕНИЯ
// ======================

function addMyMessage(text) {

    const div = document.createElement("div");

    div.className = "message my-message";
    div.textContent = text;

    chatMessages.appendChild(div);

    scrollChat();
}

function addPartnerMessage(
    text,
    participant = 1
) {

    const div =
        document.createElement("div");

    div.className =
        "message";

    // Цвет пузыря сообщения
    if (participant === 2) {

        div.style.background =
            "#8B5CF6"; // фиолетовый

    }

    if (participant === 3) {

        div.style.background =
            "#FACC15"; // жёлтый

    }

    if (participant === 4) {

        div.style.background =
            "#22C55E"; // зелёный

    }

    // Белый текст у всех
    div.style.color =
        "#FFFFFF";

    div.textContent =
        text;

    chatMessages.appendChild(div);

    scrollChat();

}

function addSystemMessage(text) {

    const div = document.createElement("div");

    div.className = "message system-message";
    div.textContent = text;

    chatMessages.appendChild(div);

    scrollChat();
}

function scrollChat() {

    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// ======================
// ЛИЧНЫЕ СООБЩЕНИЯ
// ======================

function sendPrivateMessage() {

    const target = document.getElementById("targetUser");
    const message = document.getElementById("messageText");

    const username = target.value.trim();
    const text = message.value.trim();

    if (!username) {
        showToast("Введите username");
        return;
    }

    if (!text) {
        showToast("Введите сообщение");
        return;
    }

    socket.emit("sendPrivateMessage", {
        to: username.startsWith("@") ? username : "@" + username,
        text: text
    });

    target.value = "";
    message.value = "";

    closeMessageModal();

    showToast("Сообщение отправлено");
}

// ======================
// ВХОДЯЩИЕ СООБЩЕНИЯ (ГЛАВНЫЙ ЭКРАН)
// ======================

socket.on(
    "messages",
    (msgs) => {

        msgs.forEach(msg => {

            addInboxMessage(
                msg.text,
                msg.warning
            );

        });

    }
);

// добавление в inbox

function addInboxMessage(
    text,
    warning = false
) {

    const div =
        document.createElement("div");

    div.className =
        "inbox-message";

    // предупреждение
    if (warning) {

        div.style.background =
            "#7F1D1D";

        div.style.border =
            "1px solid #EF4444";

    }

    div.textContent =
        text;

    messagesContainer.appendChild(
        div
    );

}

// ======================
// ПУШ ЛИЧНОГО СООБЩЕНИЯ
// ======================

socket.on("newPrivateMessage", (data) => {

    showToast("📩 Новое сообщение");

    addInboxMessage(data.text);
});

// ======================
// УСПЕШНАЯ ОТПРАВКА
// ======================

socket.on("privateSent", () => {
    showToast("✔ Отправлено");
});

// ======================
// ПОЛЬЗОВАТЕЛЬ НЕ НАЙДЕН
// ======================

socket.on("userNotFound", () => {
    showToast("Пользователь не найден");
});

// ======================
// ПРОФИЛЬ
// ======================

function openProfile() {
    profileModal.classList.remove("hidden");
}

// ======================
// ВЫХОД
// ======================

function logout() {

    localStorage.removeItem("username");

    socket.disconnect();

    location.reload();
}

// ======================
// МОДАЛКИ
// ======================

function openActions() {
    actionsModal.classList.remove("hidden");
}
function openRoomSelector() {

    closeActions();

    roomSelectorModal.classList.remove(
        "hidden"
    );

}

function closeActions() {
    actionsModal.classList.add("hidden");
}

function openMessageModal() {
    messageModal.classList.remove("hidden");
}

function closeMessageModal() {
    messageModal.classList.add("hidden");
}

function openCloseChatModal() {
    closeChatModal.classList.remove("hidden");
}

function closeCloseModal() {
    closeChatModal.classList.add("hidden");
}

// ======================
// ЗАВЕРШЕНИЕ ЧАТА
// ======================

function endChat() {

    socket.emit("leaveChat");

    chatPage.classList.add("hidden");

    closeChatModal.classList.add("hidden");

    showToast("Чат завершён");
}

// ======================
// TOAST
// ======================

function showToast(text) {

    toast.textContent = text;
    toast.classList.remove("hidden");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 2500);
}

// ======================
// ОТКРЫТЬ ПОДДЕРЖКУ
// ======================

function openSupport() {

    if (
        currentUser ===
        ADMIN_USERNAME
    ) {

        socket.emit(
            "getSupportList"
        );

        homePage.classList.add(
            "hidden"
        );

        supportListPage.classList.remove(
            "hidden"
        );

        return;
    }

    supportBadge.classList.add(
        "hidden"
    );

    socket.emit(
        "openSupport"
    );

    homePage.classList.add(
        "hidden"
    );

    supportPage.classList.remove(
        "hidden"
    );

}
function closeSupport() {

    supportPage.classList.add(
        "hidden"
    );

    homePage.classList.remove(
        "hidden"
    );

}
function closeSupportList() {

    supportListPage.classList.add(
        "hidden"
    );

    homePage.classList.remove(
        "hidden"
    );

}

function openAdminCloseModal() {

    adminCloseModal.classList.remove(
        "hidden"
    );

}

function closeAdminCloseModal() {

    adminCloseModal.classList.add(
        "hidden"
    );

}

function leaveAdminChat() {

    adminCloseModal.classList.add(
        "hidden"
    );

    adminSupportPage.classList.add(
        "hidden"
    );

    supportListPage.classList.remove(
        "hidden"
    );

}

function endSupportConversation() {

    if (!currentSupportUser)
        return;

    socket.emit(
        "endSupportConversation",
        currentSupportUser
    );

}

// ======================
// ПОДДЕРЖКА SOCKET.IO
// ======================

function sendSupportMessage() {

    const text =
        supportInput.value.trim();

    if (!text)
        return;

    socket.emit(
        "supportMessage",
        text
    );

    addSupportMyMessage(
        text
    );

    supportInput.value = "";

}

function addSupportMyMessage(text) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message my-message";

    div.textContent =
        text;

    supportMessages.appendChild(
        div
    );

    supportMessages.scrollTop =
        supportMessages.scrollHeight;

}

function addSupportPartnerMessage(text) {

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message";

    div.textContent =
        text;

    supportMessages.appendChild(
        div
    );

    supportMessages.scrollTop =
        supportMessages.scrollHeight;

}

// ======================
// ИСТОРИЯ ПОДДЕРЖКИ
// ======================

socket.on(
    "supportHistory",
    (messages) => {

        supportMessages.innerHTML =
            "";

        messages.forEach(
            msg => {

                if (
                    msg.sender ===
                    currentUser
                ) {

                    addSupportMyMessage(
                        msg.text
                    );

                } else {

                    addSupportPartnerMessage(
                        msg.text
                    );

                }

            }
        );

    }
);

// ======================
// СПИСОК ОБРАЩЕНИЙ
// ======================

socket.on(
    "supportList",
    (conversations) => {

        supportList.innerHTML =
            "";

        if (
            conversations.length === 0
        ) {

            supportList.innerHTML = `
                <div class="support-empty">
                    Пока нет обращений
                </div>
            `;

            return;
        }

        conversations.forEach(
            conversation => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "support-user";

                item.innerHTML = `
                    <div class="support-user-top">

                        <div class="support-user-name">
                            ${conversation.user}
                        </div>

                        ${
                            conversation.unreadForAdmin > 0
                            ? '<div class="support-user-badge"></div>'
                            : ''
                        }

                    </div>
                `;

                item.onclick =
                    () => {

                        currentSupportUser =
                            conversation.user;

                        socket.emit(
                            "openSupportConversation",
                            conversation.user
                        );

                    };

                supportList.appendChild(
                    item
                );

            }
        );

    }
);

// ======================
// ОТКРЫТЬ ДИАЛОГ
// ======================

socket.on(
    "supportConversation",
    (data) => {

        adminSupportMessages.innerHTML =
            "";

        adminSupportUser.textContent =
            data.user;

        data.messages.forEach(
            msg => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    msg.sender === currentSupportUser
                    ? "message"
                    : "message my-message";

                div.textContent =
                    msg.text;

                adminSupportMessages.appendChild(
                    div
                );

            }
        );

        supportListPage.classList.add(
            "hidden"
        );

        adminSupportPage.classList.remove(
            "hidden"
        );

    }
);

// ======================
// НОВОЕ СООБЩЕНИЕ
// ======================

socket.on(
    "newSupportMessage",
    (data) => {

        if (
            currentUser ===
            ADMIN_USERNAME
        ) {

            socket.emit(
                "getSupportList"
            );

            return;
        }

        supportBadge.classList.remove(
            "hidden"
        );

        if (
            !supportPage.classList.contains(
                "hidden"
            )
        ) {

            addSupportPartnerMessage(
                data.text
            );

        }

    }
);

socket.on(
    "adminMessageSent",
    () => {

        socket.emit(
            "getSupportList"
        );

    }
);

socket.on(
    "supportEndedAdmin",
    () => {

        adminCloseModal.classList.add(
            "hidden"
        );

        adminSupportPage.classList.add(
            "hidden"
        );

        supportListPage.classList.remove(
            "hidden"
        );

        socket.emit(
            "getSupportList"
        );

        showToast(
            "Обращение завершено"
        );

    }
);

socket.on(
    "chatStarted",
    () => {

        searchModal.classList.add(
            "hidden"
        );

        openChat();

    }
);

socket.on(
    "supportEnded",
    () => {

        supportMessages.innerHTML =
            "";

        supportPage.classList.add(
            "hidden"
        );

        homePage.classList.remove(
            "hidden"
        );

        showToast(
            "Чат поддержки завершён"
        );

    }
);



function sendAdminSupportMessage() {

    const text =
        adminSupportInput.value.trim();

    if (!text)
        return;

    socket.emit(
        "adminSupportMessage",
        {
            user:
                currentSupportUser,

            text
        }
    );

    const div =
        document.createElement(
            "div"
        );

    div.className =
        "message my-message";

    div.textContent =
        text;

    adminSupportMessages.appendChild(
        div
    );

    adminSupportMessages.scrollTop =
        adminSupportMessages.scrollHeight;

    adminSupportInput.value = "";

}

window.addEventListener(
    "click",
    (e) => {

        if (e.target === actionsModal) {
            closeActions();
        }

        if (e.target === roomSelectorModal) {

            roomSelectorModal.classList.add(
                "hidden"
            );

        }

        if (e.target === adminPanel) {
            closeAdminPanel();
        }

        // закрытие окна пользователя
        if (e.target === adminUserModal) {

            adminUserModal.classList.add(
                "hidden"
            );

        }

        // закрытие окна предупреждения
        if (e.target === warnModal) {

            warnModal.classList.add(
                "hidden"
            );

        }

        if (e.target === profileModal) {

            profileModal.classList.add(
                "hidden"
            );

        }

        if (e.target === messageModal) {

            closeMessageModal();

        }

        if (e.target === closeChatModal) {

            closeCloseModal();

        }

    }
);

socket.on(
    "accountDeleted",
    () => {

        localStorage.removeItem(
            "username"
        );

        document.body.innerHTML = `

            <div class="banned-screen">

                <div class="banned-card">

                    <h1>
                        Аккаунт удалён
                    </h1>

                    <p>
                        Ваш аккаунт был удалён администрацией
                    </p>

                </div>

            </div>

        `;

    }
);
socket.on(
    "banned",
    () => {

        document.body.innerHTML = `

            <div class="banned-screen">

                <div class="banned-card">

                    <h1>
                        Аккаунт заблокирован
                    </h1>

                    <p>
                        Вы были заблокированы администрацией
                    </p>

                </div>

            </div>

        `;

    }
);

// ======================
// АДМИН ПАНЕЛЬ
// ======================

function openAdminPanel() {

    socket.emit(
        "getAllUsers"
    );

    homePage.classList.add(
        "hidden"
    );

    adminPanel.classList.remove(
        "hidden"
    );

}

function closeAdminPanel() {

    adminPanel.classList.add(
        "hidden"
    );

    homePage.classList.remove(
        "hidden"
    );

}

socket.on(
    "allUsers",
    (users) => {

        adminUsersList.innerHTML =
            "";

        users.forEach(user => {

            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "admin-user";
            div.onclick = () => {

    selectedAdminUser =
        user.username;

    adminModalUsername.textContent =
        user.username;

    adminUserModal.classList.remove(
        "hidden"
    );

};

            div.innerHTML = `

                <div>
                    ${user.username}
                </div>

            `;

            adminUsersList.appendChild(
                div
            );

        });

    }
);
function toggleBanUser() {

    socket.emit(
        "toggleBanUser",
        selectedAdminUser
    );

}

function deleteUserAccount() {

    socket.emit(
        "deleteUser",
        selectedAdminUser
    );

    adminUserModal.classList.add(
        "hidden"
    );

}

function openWarnModal() {

    warnModal.classList.remove(
        "hidden"
    );

}

function sendWarning() {

    const text =
        warnText.value.trim();

    if (!text) return;

    socket.emit(
        "sendWarning",
        {
            user:
                selectedAdminUser,

            text
        }
    );

    warnText.value = "";

    warnModal.classList.add(
        "hidden"
    );

    showToast(
        "Предупреждение отправлено"
    );

}
socket.on(
    "warningReceived",
    (text) => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "inbox-message";

        div.style.background =
            "#7F1D1D";

        div.style.border =
            "1px solid #EF4444";

        div.innerHTML = `
            <b>
                ⚠ Предупреждение:
            </b><br>
            ${text}
        `;

        messagesContainer.prepend(
            div
        );

        showToast(
            "⚠ Получено предупреждение"
        );

    }
);


// ======================
// ENTER ОБРАБОТКА
// ======================

chatInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }

});

usernameInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {
        login();
    }

});
supportInput?.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Enter"
        ) {

            e.preventDefault();

            sendSupportMessage();

        }

    }
);
adminSupportInput?.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Enter"
        ) {

            e.preventDefault();

            sendAdminSupportMessage();

        }

    }
);