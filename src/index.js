"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = __importDefault(require("../prisma"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json()); // for parsing application/json
app.use(express_1.default.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.post("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, type, phoneNumber, username } = yield req.body;
        let newUser;
        yield prisma_1.default.$connect();
        if (type == "google") {
            newUser = yield prisma_1.default.users.create({ data: { email, username, type: "google", created_at: new Date() } });
        }
        else if (type == "email") {
            if (!password || !email)
                return res.status(400).json({
                    message: 'Insufficient data.'
                });
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            newUser = yield prisma_1.default.users.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    type: "email",
                    created_at: new Date()
                }
            });
        }
        else if (type == "phone") {
            if (!phoneNumber)
                return res.status(400).json({
                    message: 'Insufficient data.'
                });
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            newUser = yield prisma_1.default.users.create({
                data: {
                    username,
                    phoneNumber,
                    password: hashedPassword,
                    type: "phone",
                    created_at: new Date()
                }
            });
        }
        return res.status(201).json({
            message: 'User created successfully!',
            user: newUser,
            success: true
        });
    }
    catch (error) {
        if (error.meta.target == "email_1") {
            return res.status(400).json({ statusText: "Email already exists." });
        }
        else if (error.meta.target == "phoneNumber_1") {
            return res.status(400).json({ statusText: "Phone Number already exists." });
        }
        return res.status(500).json({
            error: 'Server Error.'
        });
    }
    finally {
        yield prisma_1.default.$disconnect();
    }
}));
app.get("/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.$connect();
        let idReq = req.params.id;
        let user = yield prisma_1.default.users.findUnique({ where: { id: idReq } });
        return res.status(200).json({ user });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
    finally {
        yield prisma_1.default.$disconnect();
    }
}));
app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.$connect();
        let users = yield prisma_1.default.users.findMany();
        return res.status(200).json({ data: users });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
    finally {
        yield prisma_1.default.$disconnect();
    }
}));
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
