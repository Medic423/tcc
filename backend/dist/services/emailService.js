"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer_1 = require("nodemailer");
var client_1 = require("@prisma/client");
var centerPrisma = new client_1.PrismaClient();
var EmailService = /** @class */ (function () {
    function EmailService() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    EmailService.prototype.getEmailTemplates = function () {
        return {
            newTripRequest: {
                subject: '🚑 New Transport Request - Action Required',
                html: "\n          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n            <div style=\"background: #1e40af; color: white; padding: 20px; text-align: center;\">\n              <h1>\uD83D\uDE91 New Transport Request</h1>\n            </div>\n            <div style=\"padding: 20px; background: #f8fafc;\">\n              <h2>Transport Details</h2>\n              <table style=\"width: 100%; border-collapse: collapse;\">\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Patient ID:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{patientId}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Transport Level:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{transportLevel}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Priority:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0; color: {{priorityColor}};\">{{priority}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Origin:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{originFacility}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Destination:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{destinationFacility}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Ready Window:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{readyStart}} - {{readyEnd}}</td>\n                </tr>\n                {{#if specialRequirements}}\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Special Requirements:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{specialRequirements}}</td>\n                </tr>\n                {{/if}}\n                {{#if isolation}}\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>\u26A0\uFE0F Isolation Required</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;\">Yes</td>\n                </tr>\n                {{/if}}\n                {{#if bariatric}}\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>\uD83D\uDECF\uFE0F Bariatric Transport</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;\">Yes</td>\n                </tr>\n                {{/if}}\n              </table>\n              <div style=\"margin-top: 20px; text-align: center;\">\n                <a href=\"{{dashboardUrl}}\" style=\"background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">\n                  View in Dashboard\n                </a>\n              </div>\n            </div>\n            <div style=\"background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">\n              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>\n              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>\n            </div>\n          </div>\n        ",
                text: "\nNew Transport Request - Action Required\n\nPatient ID: {{patientId}}\nTransport Level: {{transportLevel}}\nPriority: {{priority}}\nOrigin: {{originFacility}}\nDestination: {{destinationFacility}}\nReady Window: {{readyStart}} - {{readyEnd}}\n{{#if specialRequirements}}Special Requirements: {{specialRequirements}}{{/if}}\n{{#if isolation}}\u26A0\uFE0F Isolation Required: Yes{{/if}}\n{{#if bariatric}}\uD83D\uDECF\uFE0F Bariatric Transport: Yes{{/if}}\n\nView in Dashboard: {{dashboardUrl}}\n\nTCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}\n        "
            },
            tripAccepted: {
                subject: '✅ Transport Request Accepted',
                html: "\n          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n            <div style=\"background: #059669; color: white; padding: 20px; text-align: center;\">\n              <h1>\u2705 Transport Request Accepted</h1>\n            </div>\n            <div style=\"padding: 20px; background: #f0fdf4;\">\n              <p>Your transport request has been accepted by <strong>{{agencyName}}</strong>.</p>\n              <h3>Transport Details</h3>\n              <table style=\"width: 100%; border-collapse: collapse;\">\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Patient ID:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{patientId}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Accepted by:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{agencyName}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Unit Number:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{unitNumber}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>ETA:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{eta}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Contact:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{contactPhone}}</td>\n                </tr>\n              </table>\n              <div style=\"margin-top: 20px; text-align: center;\">\n                <a href=\"{{dashboardUrl}}\" style=\"background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">\n                  View in Dashboard\n                </a>\n              </div>\n            </div>\n            <div style=\"background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">\n              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>\n              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>\n            </div>\n          </div>\n        ",
                text: "\nTransport Request Accepted\n\nYour transport request has been accepted by {{agencyName}}.\n\nTransport Details:\nPatient ID: {{patientId}}\nAccepted by: {{agencyName}}\nUnit Number: {{unitNumber}}\nETA: {{eta}}\nContact: {{contactPhone}}\n\nView in Dashboard: {{dashboardUrl}}\n\nTCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}\n        "
            },
            tripStatusUpdate: {
                subject: '📋 Transport Status Update',
                html: "\n          <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n            <div style=\"background: #7c3aed; color: white; padding: 20px; text-align: center;\">\n              <h1>\uD83D\uDCCB Transport Status Update</h1>\n            </div>\n            <div style=\"padding: 20px; background: #faf5ff;\">\n              <p>Your transport request status has been updated to <strong>{{status}}</strong>.</p>\n              <h3>Transport Details</h3>\n              <table style=\"width: 100%; border-collapse: collapse;\">\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Patient ID:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{patientId}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Status:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0; color: {{statusColor}};\">{{status}}</td>\n                </tr>\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Updated:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{updatedAt}}</td>\n                </tr>\n                {{#if notes}}\n                <tr>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\"><strong>Notes:</strong></td>\n                  <td style=\"padding: 8px; border: 1px solid #e2e8f0;\">{{notes}}</td>\n                </tr>\n                {{/if}}\n              </table>\n              <div style=\"margin-top: 20px; text-align: center;\">\n                <a href=\"{{dashboardUrl}}\" style=\"background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;\">\n                  View in Dashboard\n                </a>\n              </div>\n            </div>\n            <div style=\"background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">\n              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>\n              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>\n            </div>\n          </div>\n        ",
                text: "\nTransport Status Update\n\nYour transport request status has been updated to {{status}}.\n\nTransport Details:\nPatient ID: {{patientId}}\nStatus: {{status}}\nUpdated: {{updatedAt}}\n{{#if notes}}Notes: {{notes}}{{/if}}\n\nView in Dashboard: {{dashboardUrl}}\n\nTCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}\n        "
            }
        };
    };
    EmailService.prototype.replaceTemplateVariables = function (template, data) {
        var result = template;
        // Replace simple variables
        Object.keys(data).forEach(function (key) {
            var value = data[key] || '';
            var regex = new RegExp("{{".concat(key, "}}"), 'g');
            result = result.replace(regex, String(value));
        });
        // Handle conditional blocks
        result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, function (match, condition, content) {
            return data[condition] ? content : '';
        });
        return result;
    };
    EmailService.prototype.getPriorityColor = function (priority) {
        switch (priority === null || priority === void 0 ? void 0 : priority.toUpperCase()) {
            case 'URGENT': return '#dc2626';
            case 'HIGH': return '#ea580c';
            case 'MEDIUM': return '#d97706';
            case 'LOW': return '#059669';
            default: return '#6b7280';
        }
    };
    EmailService.prototype.getStatusColor = function (status) {
        switch (status === null || status === void 0 ? void 0 : status.toUpperCase()) {
            case 'PENDING': return '#d97706';
            case 'ACCEPTED': return '#059669';
            case 'IN_PROGRESS': return '#2563eb';
            case 'COMPLETED': return '#059669';
            case 'CANCELLED': return '#dc2626';
            default: return '#6b7280';
        }
    };
    EmailService.prototype.sendEmail = function (emailData) {
        return __awaiter(this, void 0, void 0, function () {
            var templates, template, templateData, html, text, mailOptions, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        console.log('TCC_DEBUG: Sending email notification:', {
                            to: emailData.to,
                            template: emailData.template,
                            priority: emailData.priority || 'normal'
                        });
                        templates = this.getEmailTemplates();
                        template = templates[emailData.template];
                        if (!template) {
                            throw new Error("Email template '".concat(emailData.template, "' not found"));
                        }
                        templateData = __assign(__assign({}, emailData.data), { timestamp: new Date().toISOString(), dashboardUrl: process.env.FRONTEND_URL || 'http://localhost:3000', priorityColor: this.getPriorityColor(emailData.data.priority), statusColor: this.getStatusColor(emailData.data.status) });
                        html = this.replaceTemplateVariables(template.html, templateData);
                        text = this.replaceTemplateVariables(template.text, templateData);
                        mailOptions = {
                            from: "\"TCC System\" <".concat(process.env.SMTP_USER, ">"),
                            to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                            subject: this.replaceTemplateVariables(template.subject, templateData),
                            text: text,
                            html: html,
                            priority: emailData.priority === 'high' ? 'high' : 'normal'
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        result = _a.sent();
                        console.log('TCC_DEBUG: Email sent successfully:', {
                            messageId: result.messageId,
                            to: emailData.to,
                            template: emailData.template
                        });
                        // Log email delivery
                        return [4 /*yield*/, this.logEmailDelivery({
                                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                                subject: mailOptions.subject,
                                template: emailData.template,
                                messageId: result.messageId,
                                status: 'sent',
                                tripId: emailData.data.tripId
                            })];
                    case 2:
                        // Log email delivery
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error('TCC_DEBUG: Email sending failed:', error_1);
                        // Log email failure
                        return [4 /*yield*/, this.logEmailDelivery({
                                to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
                                subject: emailData.template,
                                template: emailData.template,
                                messageId: null,
                                status: 'failed',
                                error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                tripId: emailData.data.tripId
                            })];
                    case 4:
                        // Log email failure
                        _a.sent();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.logEmailDelivery = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, centerPrisma.systemAnalytics.create({
                                data: {
                                    metricName: 'email_delivery',
                                    metricValue: {
                                        to: data.to,
                                        subject: data.subject,
                                        template: data.template,
                                        messageId: data.messageId,
                                        status: data.status,
                                        error: data.error,
                                        tripId: data.tripId,
                                        timestamp: new Date().toISOString()
                                    }
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('TCC_DEBUG: Failed to log email delivery:', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.sendNewTripNotification = function (tripData, agencyEmails) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!agencyEmails.length) {
                            console.log('TCC_DEBUG: No agency emails provided for trip notification');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.sendEmail({
                                to: agencyEmails,
                                template: 'newTripRequest',
                                data: {
                                    tripId: tripData.id,
                                    patientId: tripData.patientId,
                                    transportLevel: tripData.transportLevel,
                                    priority: tripData.priority,
                                    originFacility: ((_a = tripData.originFacility) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                                    destinationFacility: ((_b = tripData.destinationFacility) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown',
                                    readyStart: new Date(tripData.readyStart).toLocaleString(),
                                    readyEnd: new Date(tripData.readyEnd).toLocaleString(),
                                    specialRequirements: tripData.specialRequirements,
                                    isolation: tripData.isolation,
                                    bariatric: tripData.bariatric
                                },
                                priority: tripData.priority === 'URGENT' ? 'high' : 'normal'
                            })];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    EmailService.prototype.sendTripAcceptedNotification = function (tripData, hospitalEmail) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.sendEmail({
                            to: hospitalEmail,
                            template: 'tripAccepted',
                            data: {
                                tripId: tripData.id,
                                patientId: tripData.patientId,
                                agencyName: ((_a = tripData.assignedAgency) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown Agency',
                                unitNumber: ((_b = tripData.assignedUnit) === null || _b === void 0 ? void 0 : _b.unitNumber) || 'TBD',
                                eta: tripData.eta || 'TBD',
                                contactPhone: ((_c = tripData.assignedAgency) === null || _c === void 0 ? void 0 : _c.phone) || 'Contact TCC'
                            }
                        })];
                    case 1: return [2 /*return*/, _d.sent()];
                }
            });
        });
    };
    EmailService.prototype.sendTripStatusUpdate = function (tripData, hospitalEmail, notes) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendEmail({
                            to: hospitalEmail,
                            template: 'tripStatusUpdate',
                            data: {
                                tripId: tripData.id,
                                patientId: tripData.patientId,
                                status: tripData.status,
                                updatedAt: new Date(tripData.updatedAt).toLocaleString(),
                                notes: notes
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EmailService.prototype.testEmailConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.transporter.verify()];
                    case 1:
                        _a.sent();
                        console.log('TCC_DEBUG: Email service connection verified');
                        return [2 /*return*/, true];
                    case 2:
                        error_3 = _a.sent();
                        console.error('TCC_DEBUG: Email service connection failed:', error_3);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send SMS notification using email-to-SMS gateway
     */
    EmailService.prototype.sendSMS = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var smsEmail, mailOptions, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        console.log('TCC_DEBUG: SMS notification via email gateway:', {
                            to: data.to,
                            message: data.message,
                            priority: data.priority || 'normal'
                        });
                        smsEmail = this.convertPhoneToSMSGateway(data.to);
                        if (!smsEmail) {
                            console.log('TCC_DEBUG: Invalid phone number format for SMS gateway');
                            return [2 /*return*/, false];
                        }
                        mailOptions = {
                            from: "\"TCC SMS\" <".concat(process.env.SMTP_USER, ">"),
                            to: smsEmail,
                            subject: '', // SMS gateways don't use subject
                            text: data.message,
                            html: data.message
                        };
                        return [4 /*yield*/, this.transporter.sendMail(mailOptions)];
                    case 1:
                        result = _a.sent();
                        console.log('TCC_DEBUG: SMS sent via email gateway:', {
                            to: data.to,
                            smsEmail: smsEmail,
                            messageId: result.messageId
                        });
                        // Log SMS delivery
                        return [4 /*yield*/, this.logSMSDelivery({
                                to: data.to,
                                message: data.message,
                                status: 'sent',
                                messageId: result.messageId,
                                tripId: null
                            })];
                    case 2:
                        // Log SMS delivery
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_4 = _a.sent();
                        console.error('TCC_DEBUG: SMS sending failed:', error_4);
                        // Log SMS failure
                        return [4 /*yield*/, this.logSMSDelivery({
                                to: data.to,
                                message: data.message,
                                status: 'failed',
                                messageId: null,
                                error: error_4 instanceof Error ? error_4.message : 'Unknown error',
                                tripId: null
                            })];
                    case 4:
                        // Log SMS failure
                        _a.sent();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert phone number to email-to-SMS gateway address
     */
    EmailService.prototype.convertPhoneToSMSGateway = function (phoneNumber) {
        // Remove all non-digit characters
        var cleaned = phoneNumber.replace(/\D/g, '');
        // Handle different phone number formats
        var digits = cleaned;
        // If it starts with 1 and is 11 digits, remove the 1
        if (digits.length === 11 && digits.startsWith('1')) {
            digits = digits.substring(1);
        }
        // Must be 10 digits for US numbers
        if (digits.length !== 10) {
            console.log('TCC_DEBUG: Invalid phone number length:', digits.length);
            return null;
        }
        // Try multiple SMS gateways for better delivery
        var gateways = [
            "".concat(digits, "@vtext.com"), // Verizon
            "".concat(digits, "@txt.att.net"), // AT&T
            "".concat(digits, "@messaging.sprintpcs.com"), // Sprint
            "".concat(digits, "@tmomail.net"), // T-Mobile
            "".concat(digits, "@email.uscc.net"), // US Cellular
            "".concat(digits, "@vtext.com") // Default to Verizon
        ];
        // Return the first gateway (Verizon) as primary
        // In production, you might want to implement carrier detection
        return gateways[0];
    };
    /**
     * Get all SMS gateways for a phone number (for redundancy)
     */
    EmailService.prototype.getAllSMSGateways = function (phoneNumber) {
        var cleaned = phoneNumber.replace(/\D/g, '');
        var digits = cleaned;
        if (digits.length === 11 && digits.startsWith('1')) {
            digits = digits.substring(1);
        }
        if (digits.length !== 10) {
            return [];
        }
        return [
            "".concat(digits, "@vtext.com"), // Verizon
            "".concat(digits, "@txt.att.net"), // AT&T
            "".concat(digits, "@messaging.sprintpcs.com"), // Sprint
            "".concat(digits, "@tmomail.net"), // T-Mobile
            "".concat(digits, "@email.uscc.net") // US Cellular
        ];
    };
    /**
     * Send SMS for new trip request
     */
    EmailService.prototype.sendNewTripSMS = function (tripData, agencyPhones) {
        return __awaiter(this, void 0, void 0, function () {
            var message, allSent, _i, agencyPhones_1, phone, success;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!agencyPhones.length) {
                            console.log('TCC_DEBUG: No agency phone numbers provided for SMS notification');
                            return [2 /*return*/, false];
                        }
                        message = "\uD83D\uDE91 NEW TRANSPORT REQUEST\n" +
                            "Patient: ".concat(tripData.patientId, "\n") +
                            "Level: ".concat(tripData.transportLevel, "\n") +
                            "Priority: ".concat(tripData.priority, "\n") +
                            "From: ".concat(((_a = tripData.originFacility) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown', "\n") +
                            "To: ".concat(((_b = tripData.destinationFacility) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown', "\n") +
                            "Ready: ".concat(new Date(tripData.readyStart).toLocaleString(), "\n") +
                            "View: ".concat(process.env.FRONTEND_URL || 'http://localhost:3000');
                        allSent = true;
                        _i = 0, agencyPhones_1 = agencyPhones;
                        _c.label = 1;
                    case 1:
                        if (!(_i < agencyPhones_1.length)) return [3 /*break*/, 4];
                        phone = agencyPhones_1[_i];
                        return [4 /*yield*/, this.sendSMS({
                                to: phone,
                                message: message,
                                priority: tripData.priority === 'URGENT' ? 'high' : 'normal'
                            })];
                    case 2:
                        success = _c.sent();
                        if (!success)
                            allSent = false;
                        _c.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, allSent];
                }
            });
        });
    };
    /**
     * Send SMS for trip status update
     */
    EmailService.prototype.sendTripStatusSMS = function (tripData, hospitalPhone) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!hospitalPhone) {
                            console.log('TCC_DEBUG: No hospital phone number provided for SMS notification');
                            return [2 /*return*/, false];
                        }
                        message = "\uD83D\uDCCB TRANSPORT UPDATE\n" +
                            "Patient: ".concat(tripData.patientId, "\n") +
                            "Status: ".concat(tripData.status, "\n") +
                            "Updated: ".concat(new Date(tripData.updatedAt).toLocaleString(), "\n") +
                            "View: ".concat(process.env.FRONTEND_URL || 'http://localhost:3000');
                        return [4 /*yield*/, this.sendSMS({
                                to: hospitalPhone,
                                message: message,
                                priority: 'normal'
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EmailService.prototype.logSMSDelivery = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, centerPrisma.systemAnalytics.create({
                                data: {
                                    metricName: 'sms_delivery',
                                    metricValue: {
                                        to: data.to,
                                        message: data.message,
                                        messageId: data.messageId,
                                        status: data.status,
                                        error: data.error,
                                        tripId: data.tripId,
                                        timestamp: new Date().toISOString()
                                    }
                                }
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('TCC_DEBUG: Failed to log SMS delivery:', error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    EmailService.prototype.testSMSConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var testPhone, smsEmail, emailConnected, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('TCC_DEBUG: Testing SMS service via email gateway');
                        testPhone = '5551234567';
                        smsEmail = this.convertPhoneToSMSGateway(testPhone);
                        if (!smsEmail) {
                            console.log('TCC_DEBUG: SMS gateway conversion failed');
                            return [2 /*return*/, false];
                        }
                        console.log('TCC_DEBUG: SMS gateway conversion successful:', {
                            phone: testPhone,
                            smsEmail: smsEmail
                        });
                        return [4 /*yield*/, this.testEmailConnection()];
                    case 1:
                        emailConnected = _a.sent();
                        if (emailConnected) {
                            console.log('TCC_DEBUG: SMS service ready (using email gateway)');
                            return [2 /*return*/, true];
                        }
                        else {
                            console.log('TCC_DEBUG: SMS service failed (email service not available)');
                            return [2 /*return*/, false];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('TCC_DEBUG: SMS service connection failed:', error_6);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return EmailService;
}());
exports.default = new EmailService();
