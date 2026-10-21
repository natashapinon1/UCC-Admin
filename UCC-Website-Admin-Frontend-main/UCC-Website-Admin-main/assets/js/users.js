    (function () {
        const $ = id => document.getElementById(id);
        const hour = 3600000, day = 86400000;

        const users = [
            {id: 1, username: "admin123",     email: "admin123@ucc.edu.ph",       role: "admin",  status: "active",   lastLogin: Date.now() - 2 * hour},
            {id: 2, username: "editor.maria", email: "maria.santos@ucc.edu.ph",   role: "editor", status: "active",   lastLogin: Date.now() - 1 * day},
            {id: 3, username: "jdelacruz",    email: "juan.delacruz@ucc.edu.ph",  role: "editor", status: "active",   lastLogin: Date.now() - 6 * day},
            {id: 4, username: "roberto_cruz", email: "roberto.cruz@ucc.edu.ph",   role: "admin",  status: "inactive", lastLogin: Date.now() - 40 * day},
            {id: 5, username: "newhire",      email: "new.hire@ucc.edu.ph",       role: "editor", status: "active",   lastLogin: null}
        ];
        let nextId = 6;
        let editingId = null;
        let showingAll = false;
        const pageSize = 10;

        const tbody        = $("userTableBody");
        const search       = $("userSearch");
        const modal        = $("userFormModal");
        const form         = $("userForm");
        const previewModal = $("userPreviewModal");

        const esc = v => String(v)
            .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
        const roleLabel = r => (r === "admin" ? "Administrator" : "Editor");
        const initial = name => ((name || "").trim()[0] || "U").toUpperCase();
        const fmtLogin = ts => ts
            ? new Date(ts).toLocaleString("en-US", {year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"})
            : "Never";
        const icons = () => { if (window.lucide) lucide.createIcons(); };

        function toast(message) {
            const t = $("uiToast");
            t.textContent = message;
            t.classList.add("show");
            clearTimeout(toast.timer);
            toast.timer = setTimeout(() => t.classList.remove("show"), 2400);
        }
        function render() {
            const q = search.value.trim().toLowerCase();

            const list = users.filter(u =>
                (u.username + " " + u.email + " " + roleLabel(u.role)).toLowerCase().includes(q)
            );
            list.sort((a, b) => a.username.localeCompare(b.username));

            const visible = showingAll ? list : list.slice(0, pageSize);

            tbody.innerHTML = visible.map(u => `
                <tr data-id="${u.id}">
                    <td>
                        <div class="user-cell">
                            <span class="user-avatar-sm">${esc(initial(u.username))}</span>
                            <span class="cell-ellipsis user-name" title="${esc(u.username)}">${esc(u.username)}</span>
                        </div>
                    </td>
                    <td><span class="cell-ellipsis" title="${esc(u.email)}">${esc(u.email)}</span></td>
                    <td><span class="role-badge ${u.role}">${roleLabel(u.role)}</span></td>
                    <td><span class="cell-ellipsis">${esc(fmtLogin(u.lastLogin))}</span></td>
                    <td><span class="status-badge ${u.status === "active" ? "status-published" : "status-inactive-user"}">${u.status === "active" ? "Active" : "Inactive"}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn view" data-action="view" type="button" title="View user" aria-label="View ${esc(u.username)}"><i data-lucide="eye"></i></button>
                            <button class="action-btn edit" data-action="edit" type="button" title="Edit user" aria-label="Edit ${esc(u.username)}"><i data-lucide="pencil"></i></button>
                            <button class="action-btn archive" data-action="delete" type="button" title="Delete user" aria-label="Delete ${esc(u.username)}"><i data-lucide="trash-2"></i></button>
                        </div>
                    </td>
                </tr>`).join("");

            $("userCount").textContent = list.length + (list.length === 1 ? " user" : " users");
            $("userEmptyState").hidden = list.length !== 0;
            $("showMoreUsers").hidden = list.length <= pageSize;
            $("showMoreUsers").textContent = showingAll ? "Show less" : "Show more";
            $("userEndMessage").hidden = !(list.length > pageSize && showingAll);
            icons();
        }
        function openForm(u) {
            editingId = u ? u.id : null;
            $("userFormTitle").textContent = u ? "Edit User" : "Add New User";
            $("userFormDescription").textContent = u ? "Update this administrative account." : "Create a new administrative account.";
            $("userId").value   = u ? u.id : "";
            $("username").value = u ? u.username : "";
            $("email").value    = u ? u.email : "";
            $("role").value     = u ? u.role : "admin";
            $("status").value   = u ? u.status : "active";
            $("password").value = "";
            $("password").required = !u;
            $("passwordHint").textContent = u ? "Leave blank to keep the current password." : "Use at least 8 characters.";

            modal.classList.add("open");
            modal.setAttribute("aria-hidden", "false");
            icons();
            $("username").focus();
        }

        function closeForm() {
            modal.classList.remove("open");
            modal.setAttribute("aria-hidden", "true");
            editingId = null;
            form.reset();
        }

        function openPreview(info) {
            $("previewUserNote").textContent     = info.note;
            $("previewUserAvatar").textContent   = initial(info.username);
            $("previewUserName").textContent     = info.username || "—";
            $("previewUserEmail").textContent    = info.email || "—";
            $("previewUserRole").textContent     = roleLabel(info.role);
            $("previewUserStatus").textContent   = info.status === "active" ? "Active" : "Inactive";
            $("previewUserLastLogin").textContent = fmtLogin(info.lastLogin);
            $("previewUserPassword").textContent = info.passwordText;

            previewModal.classList.add("open");
            previewModal.setAttribute("aria-hidden", "false");
            icons();
        }

        function closePreview() {
            previewModal.classList.remove("open");
            previewModal.setAttribute("aria-hidden", "true");
        }

        $("previewUserBtn").addEventListener("click", () => {
            const existing = editingId !== null ? users.find(x => x.id === editingId) : null;
            const password = $("password").value;

            openPreview({
                note: "This is how the account will look once saved.",
                username: $("username").value.trim(),
                email: $("email").value.trim(),
                role: $("role").value,
                status: $("status").value,
                lastLogin: existing ? existing.lastLogin : null,
                passwordText: password ? "Hidden (" + password.length + " characters)" : (existing ? "Unchanged" : "Not set yet")
            });
        });

        function viewUser(u) {
            openPreview({
                note: "Saved account details.",
                username: u.username,
                email: u.email,
                role: u.role,
                status: u.status,
                lastLogin: u.lastLogin,
                passwordText: "Hidden"
            });
        }

        async function deleteUser(u) {
            let confirmed;
            if (window.Swal) {
                const res = await Swal.fire({
                    title: "Delete this user?",
                    text: u.username,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Yes, delete",
                    confirmButtonColor: "#b42318"
                });
                confirmed = res.isConfirmed;
            } else {
                confirmed = confirm('Delete user "' + u.username + '"?');
            }
            if (!confirmed) return;

            users.splice(users.findIndex(x => x.id === u.id), 1);
            render();
            toast("User deleted.");
        }

        $("addUserBtn").addEventListener("click", () => openForm(null));

        search.addEventListener("input", () => { showingAll = false; render(); });

        $("showMoreUsers").addEventListener("click", () => { showingAll = !showingAll; render(); });

        tbody.addEventListener("click", e => {
            const btn = e.target.closest("[data-action]");
            if (!btn) return;
            const row = btn.closest("tr[data-id]");
            if (!row) return;
            const u = users.find(x => x.id === Number(row.dataset.id));
            if (!u) return;

            if (btn.dataset.action === "view") viewUser(u);
            if (btn.dataset.action === "edit") openForm(u);
            if (btn.dataset.action === "delete") deleteUser(u);
        });

        modal.addEventListener("click", e => {
            if (e.target.closest("[data-close-modal]")) closeForm();
        });
        previewModal.addEventListener("click", e => {
            if (e.target.closest("[data-close-preview]")) closePreview();
        });

        form.addEventListener("submit", e => {
            e.preventDefault();

            const data = {
                username: $("username").value.trim(),
                email:    $("email").value.trim(),
                role:     $("role").value,
                status:   $("status").value
            };
            const password = $("password").value;

            if (users.some(u => u.id !== editingId && u.username.toLowerCase() === data.username.toLowerCase())) {
                toast("That name is already taken.");
                $("username").focus();
                return;
            }
            if (users.some(u => u.id !== editingId && u.email.toLowerCase() === data.email.toLowerCase())) {
                toast("That email is already used by another user.");
                $("email").focus();
                return;
            }
            if ((editingId === null || password) && password.length < 8) {
                toast("Password must be at least 8 characters.");
                $("password").focus();
                return;
            }

            if (editingId !== null) {
                const u = users.find(x => x.id === editingId);
                if (u) Object.assign(u, data);
                toast("User updated.");
            } else {
                users.push({id: nextId++, lastLogin: null, ...data});
                toast("User added.");
            }

            showingAll = false;
            render();
            closeForm();
        });

        document.addEventListener("keydown", e => {
            if (e.key !== "Escape") return;
            if (previewModal.classList.contains("open")) closePreview();
            else if (modal.classList.contains("open")) closeForm();
        });

        render();
    })();