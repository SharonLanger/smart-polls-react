/* properties.js */
const backend_url_base='http://localhost:5000/'

export const properties = {
    backend_url: {
        base: backend_url_base,
        user: backend_url_base + 'user',
        polls: backend_url_base + 'poll',
        answer: backend_url_base + 'answer',
        group: backend_url_base + 'group',
        group_users: backend_url_base + 'group_users',
        admin: backend_url_base + 'admin',
    },
    user: {
        user_name: '',
    },
};