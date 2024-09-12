document.addEventListener('DOMContentLoaded', () => {
    console.log("hello");
    document.querySelectorAll('.offersContainer button').forEach(button => {
        button.addEventListener('click', function() {
            const roleValue = this.getAttribute('data-role');
            const roleSelect = document.getElementById('role');
            if (roleSelect) {
                
                document.querySelector('.contactUs').scrollIntoView({ behavior: 'smooth' });
                roleSelect.value = roleValue;
                const event = new Event('change');
                roleSelect.dispatchEvent(event);
            }
        });
    });

   
    const burger = document.querySelector('.navburger');
    const navLinks = document.querySelector('.nav-links');
    const links = navLinks.querySelectorAll('a');

    burger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    
    const checkboxes = document.querySelectorAll('.role-options input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', (event) => {
            const label = event.target.parentElement;
            label.style.color = event.target.checked ? '#333' : '#999';
        });
    });

    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const loadingOverlay = document.getElementById('loadingOverlay');
            const loadingIcon = document.querySelector('.loading-icon');
            const responseMessage = document.getElementById('responseMessage');

            
            loadingOverlay.classList.remove('hidden');
            loadingOverlay.classList.add('show');
            loadingIcon.classList.remove('hidden');
            responseMessage.classList.add('hidden');
            responseMessage.textContent = '';

            const formData = {
                fullName: document.getElementById('fullName').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                email: document.getElementById('email').value,
                role: document.getElementById('role').value,
            };

            fetch('/submit_form', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.status === 429) { // Если ошибка лимита запросов
                    throw new Error(text || 'Too many requests. Please try again later.');
                }
                if (!response.ok) {
                    try {
                        const errorData = JSON.parse(text);
                        throw new Error(errorData.error || 'Network error');
                    } catch (e) {
                        throw new Error('Network error');
                    }
                }
                return JSON.parse(text);
            })
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
    
});



