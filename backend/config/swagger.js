const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Турнирной Платформы CS2',
            version: '1.0.0',
            description: 'Документация API для платформы CS2 Tournaments',
            contact: {
                name: 'Поддержка API',
                email: 'support@cs2tournaments.asia',
            },
        },
        servers: [
            {
                url: '/api',
                description: 'Основной API Сервер',
            },
            {
                url: 'http://localhost:3000/api',
                description: 'Локальный сервер разработки',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    // Путь к файлам с документацией
    apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
