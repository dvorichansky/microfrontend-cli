# mf-cli

**mf-cli** — це CLI-інструмент для автоматизованої генерації масштабованих веб-додатків на основі мікрофронтенд-архітектури з використанням Module Federation, Webpack, React/Vue/Vanilla.

## 🎯 Призначення

Інструмент дозволяє швидко створювати shell-додатки, мікрофронтенди або спільні модулі з уніфікованою конфігурацією, що зменшує час налаштування та підвищує узгодженість між командами.

## ⚙️ Встановлення

```bash
npx mf-cli
```

> Потрібно встановлений Node.js (версія 18 або новіша)

## 🚀 Можливості

-   Інтерактивна генерація проєкту з використанням `@clack/prompts`
-   Підтримка параметрів через CLI або конфіг-файл `mf-cli.config.json`
-   Можливість створення:
    -   shell-контейнера
    -   мікрофронтенду
    -   спільного (shared) модуля
-   Підтримка фреймворків: `react`, `vue`, `vanilla`
-   Підтримка стилів: `tailwind`, `bootstrap`, `sass` або без стилів
-   Налаштування ESLint
-   Генерація `.env.development` з автоматичним або заданим портом
-   Підтримка middleware-функцій (before/after генерації)

## 🏗️ Структура команди

```bash
npx mf-cli [options]

# Приклади
npx mf-cli -n header -t microfrontend -f react --style tailwind
npx mf-cli --structure monorepo --type shell
```

### Основні опції

| Параметр      | Опис                                          | Варіанти                               |
| ------------- | --------------------------------------------- | -------------------------------------- |
| `--structure` | Структура проєкту                             | `standalone` \| `monorepo`             |
| `--type`      | Тип проєкту                                   | `shell` \| `microfrontend` \| `shared` |
| `--name`      | Назва проєкту                                 | (будь-яке унікальне ім'я)              |
| `--framework` | Фреймворк                                     | `react` \| `vue` \| `vanilla`          |
| `--style`     | Стилістичний фреймворк                        | `tailwind` \| `bootstrap` \| `none`    |
| `--sass`      | Додати Sass (неактивно, якщо обрано Tailwind) | прапор (`--sass`)                      |
| `--no-eslint` | Вимкнути ESLint                               | прапор                                 |
| `--port`      | Порт для `.env.development`                   | число                                  |

## ⚙️ Глобальна конфігурація

Файл `mf-cli.config.json` дозволяє заздалегідь задати типові значення:

```json
{
    "defaultStructure": "monorepo",
    "defaultType": "microfrontend",
    "defaultFramework": "react",
    "defaultStyleFramework": "tailwind",
    "eslintExtendPath": "./config/eslint-base.js",
    "middleware": {
        "beforeGenerate": ["./middleware/preGenerate.js"],
        "afterGenerate": ["./middleware/postGenerate.js"]
    }
}
```

## 🔌 Middleware

Можна вказати скрипти, які виконаються до або після генерації:

-   `beforeGenerate`: зміна конфігурації перед генерацією
-   `afterGenerate`: дії після створення (наприклад, `npm install`)

```js
// middleware/preGenerate.js
module.exports = (options) => {
    options.name = `mf-${options.name}`;
    return options;
};
```

## 📦 Шаблони

Проєкти створюються на базі готових шаблонів для:

-   React з Webpack + Module Federation
-   Vue з Webpack + Module Federation
-   Vanilla JS з Webpack + Module Federation

## 📁 Приклад створеної структури

```
my-mf-app/
├── src/
│   └── index.tsx
├── webpack.config.js
├── .env.development
├── package.json
└── ...
```

## 📚 Ліцензія

MIT
