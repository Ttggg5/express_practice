"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../db"));
const router = express_1.default.Router();
var SortKey;
(function (SortKey) {
    SortKey["id"] = "id";
    SortKey["username"] = "username";
    SortKey["email"] = "email";
    SortKey["role"] = "role";
})(SortKey || (SortKey = {}));
// Get all users
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const size = parseInt(req.query.size) || 20;
        const search = (req.query.search || '').trim();
        const sortKey = req.query.sortKey || SortKey.username;
        const sortOrder = req.query.sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        const offset = page * size;
        const searchQuery = `%${search}%`;
        const [rows] = await db_1.default.query(`
        SELECT id, username, email, role, is_suspended
        FROM users
        WHERE id LIKE ? OR username LIKE ? OR email LIKE ?
        ORDER BY ${sortKey} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [searchQuery, searchQuery, searchQuery, size, offset]);
        res.json(rows);
    }
    catch (err) {
        console.error('User fetch error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update user (suspend, promote, etc.)
router.put('/:id', async (req, res) => {
    const { role, isSuspended } = req.body;
    const userId = req.params.id;
    await db_1.default.query('UPDATE users SET role = ?, is_suspended = ? WHERE id = ?', [role, isSuspended, userId]);
    res.json({ success: true });
});
// Delete user
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;
    await db_1.default.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ success: true });
});
exports.default = router;
