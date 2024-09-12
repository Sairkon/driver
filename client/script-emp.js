document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = document.querySelectorAll('.role-options input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const label = event.target.parentElement;
            label.style.color = event.target.checked ? '#333' : '#999';
        });
    });

    
    
    if (window.location.pathname === "/employee-form"){
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        console.log("employeeForm существует на странице employee-form");
        employeeForm.addEventListener('submit', function (event) {
            
            event.preventDefault();
            console.log("Форма отправляется через JavaScript");
            const loadingOverlay = document.getElementById('loadingOverlay');
            const loadingIcon = document.querySelector('.loading-icon');
            const responseMessage = document.getElementById('responseMessage');

            
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.classList.add('show');
            loadingIcon.classList.remove('hidden');
            responseMessage.classList.add('hidden');
            responseMessage.textContent = '';

            

            const formData = {
                Name: document.getElementById('Name').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                companyName: document.getElementById('companyName').value,
                roles: Array.from(document.querySelectorAll('input[name="roles"]:checked')).map(el => el.value)
            };
            console.log(formData);
            fetch('/emp_form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.text().then(text => {
                if (response.status === 429) { // Если ошибка лимита запросов
                    throw new Error(text || 'Too many requests. Please try again later.');
                }
                if (!response.ok) {
                    throw new Error(text || 'Network error'); // Используем текст ответа в качестве сообщения об ошибке
                }
                return JSON.parse(text);
            }))
            .then(data => {
                setTimeout(() => {
                    loadingIcon.classList.add('hidden'); 
                    responseMessage.classList.remove('hidden'); 
                    responseMessage.innerHTML = data.success;
                    
                    setTimeout(() => {
                        loadingOverlay.classList.remove('show');
                        loadingOverlay.classList.add('hidden');
                    }, 3000);
                }, 1200); 
            })
            .catch(error => {
                setTimeout(() => {
                    loadingIcon.classList.add('hidden'); 
                    responseMessage.classList.remove('hidden');
                    responseMessage.textContent = error.message || 'Network error. Please try again.';
                    
                    
                    setTimeout(() => {
                        loadingOverlay.classList.remove('show');
                        loadingOverlay.classList.add('hidden');
                    }, 3000);
                }, 1200); 
                console.error('Ошибка:', error);
            });
        });
    }
    else{
        console.log("employeeForm не существует на странице employee-form");
    }
    } else {
        console.log("Скрипт выполняется на другой странице:", window.location.pathname);
    }
});