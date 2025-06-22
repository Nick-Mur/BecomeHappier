export class ComponentLoader {
    static async loadComponent(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Ошибка при загрузке компонента:', error);
            return null;
        }
    }
    
    static async loadTemplate(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const html = await response.text();
            const template = document.createElement('template');
            template.innerHTML = html;
            return template;
        } catch (error) {
            console.error('Ошибка при загрузке шаблона:', error);
            return null;
        }
    }
    
    static async loadAllComponents() {
        const components = [
            'main-screen.html',
            'calendar-screen.html',
            'charts-screen.html',
            'sets-screen.html'
        ];
        
        const templates = [
            'set-item.html',
            'calendar-day.html'
        ];
        
        // Загрузка компонентов
        for (const component of components) {
            const html = await this.loadComponent(`src/html/components/${component}`);
            if (html) {
                document.querySelector('.max-w-lg').insertAdjacentHTML('beforeend', html);
            }
        }
        
        // Загрузка шаблонов
        for (const template of templates) {
            const templateElement = await this.loadTemplate(`src/html/templates/${template}`);
            if (templateElement) {
                document.getElementById('templates').appendChild(templateElement);
            }
        }
    }
} 