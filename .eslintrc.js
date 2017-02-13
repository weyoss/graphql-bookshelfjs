module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "airbnb-base",
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-underscore-dangle":0,
        "no-unused-expressions":0,
        "no-unused-vars":0,
        "no-prototype-builtins":0,
        "strict": 0,
        "no-trailing-spaces": 0,
        "guard-for-in":0,
        "no-restricted-syntax":0,
        "no-param-reassign":0,
        "no-empty":0,
        "max-len":["error", 120],
        "generator-star-spacing": 0,
        "arrow-body-style": ["error", "always"]
    }
};