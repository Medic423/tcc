import nodemailer from 'nodemailer';
import { PrismaClient } from '../../node_modules/.prisma/center';

const centerPrisma = new PrismaClient();

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string | string[];
  template: string;
  data: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private getEmailTemplates(): Record<string, EmailTemplate> {
    return {
      newTripRequest: {
        subject: '🚑 New Transport Request - Action Required',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
              <h1>🚑 New Transport Request</h1>
            </div>
            <div style="padding: 20px; background: #f8fafc;">
              <h2>Transport Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{patientId}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Transport Level:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{transportLevel}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Priority:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: {{priorityColor}};">{{priority}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Origin:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{originFacility}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Destination:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{destinationFacility}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Ready Window:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{readyStart}} - {{readyEnd}}</td>
                </tr>
                {{#if specialRequirements}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Special Requirements:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{specialRequirements}}</td>
                </tr>
                {{/if}}
                {{#if isolation}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>⚠️ Isolation Required</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;">Yes</td>
                </tr>
                {{/if}}
                {{#if bariatric}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>🛏️ Bariatric Transport</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: #dc2626;">Yes</td>
                </tr>
                {{/if}}
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="{{dashboardUrl}}" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in Dashboard
                </a>
              </div>
            </div>
            <div style="background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>
              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>
            </div>
          </div>
        `,
        text: `
New Transport Request - Action Required

Patient ID: {{patientId}}
Transport Level: {{transportLevel}}
Priority: {{priority}}
Origin: {{originFacility}}
Destination: {{destinationFacility}}
Ready Window: {{readyStart}} - {{readyEnd}}
{{#if specialRequirements}}Special Requirements: {{specialRequirements}}{{/if}}
{{#if isolation}}⚠️ Isolation Required: Yes{{/if}}
{{#if bariatric}}🛏️ Bariatric Transport: Yes{{/if}}

View in Dashboard: {{dashboardUrl}}

TCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}
        `
      },
      tripAccepted: {
        subject: '✅ Transport Request Accepted',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #059669; color: white; padding: 20px; text-align: center;">
              <h1>✅ Transport Request Accepted</h1>
            </div>
            <div style="padding: 20px; background: #f0fdf4;">
              <p>Your transport request has been accepted by <strong>{{agencyName}}</strong>.</p>
              <h3>Transport Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{patientId}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Accepted by:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{agencyName}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Unit Number:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{unitNumber}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>ETA:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{eta}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Contact:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{contactPhone}}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="{{dashboardUrl}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in Dashboard
                </a>
              </div>
            </div>
            <div style="background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>
              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>
            </div>
          </div>
        `,
        text: `
Transport Request Accepted

Your transport request has been accepted by {{agencyName}}.

Transport Details:
Patient ID: {{patientId}}
Accepted by: {{agencyName}}
Unit Number: {{unitNumber}}
ETA: {{eta}}
Contact: {{contactPhone}}

View in Dashboard: {{dashboardUrl}}

TCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}
        `
      },
      tripStatusUpdate: {
        subject: '📋 Transport Status Update',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #7c3aed; color: white; padding: 20px; text-align: center;">
              <h1>📋 Transport Status Update</h1>
            </div>
            <div style="padding: 20px; background: #faf5ff;">
              <p>Your transport request status has been updated to <strong>{{status}}</strong>.</p>
              <h3>Transport Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Patient ID:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{patientId}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Status:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0; color: {{statusColor}};">{{status}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Updated:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{updatedAt}}</td>
                </tr>
                {{#if notes}}
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Notes:</strong></td>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">{{notes}}</td>
                </tr>
                {{/if}}
              </table>
              <div style="margin-top: 20px; text-align: center;">
                <a href="{{dashboardUrl}}" style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View in Dashboard
                </a>
              </div>
            </div>
            <div style="background: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
              <p>TCC_DEBUG: This email was sent by the Transport Control Center system</p>
              <p>Request ID: {{tripId}} | Sent: {{timestamp}}</p>
            </div>
          </div>
        `,
        text: `
Transport Status Update

Your transport request status has been updated to {{status}}.

Transport Details:
Patient ID: {{patientId}}
Status: {{status}}
Updated: {{updatedAt}}
{{#if notes}}Notes: {{notes}}{{/if}}

View in Dashboard: {{dashboardUrl}}

TCC_DEBUG: Request ID: {{tripId}} | Sent: {{timestamp}}
        `
      }
    };
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let result = template;
    
    // Replace simple variables
    Object.keys(data).forEach(key => {
      const value = data[key] || '';
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });

    // Handle conditional blocks
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      return data[condition] ? content : '';
    });

    return result;
  }

  private getPriorityColor(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'LOW': return '#059669';
      default: return '#6b7280';
    }
  }

  private getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#d97706';
      case 'ACCEPTED': return '#059669';
      case 'IN_PROGRESS': return '#2563eb';
      case 'COMPLETED': return '#059669';
      case 'CANCELLED': return '#dc2626';
      default: return '#6b7280';
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('TCC_DEBUG: Sending email notification:', {
        to: emailData.to,
        template: emailData.template,
        priority: emailData.priority || 'normal'
      });

      const templates = this.getEmailTemplates();
      const template = templates[emailData.template];
      
      if (!template) {
        throw new Error(`Email template '${emailData.template}' not found`);
      }

      // Add common data
      const templateData = {
        ...emailData.data,
        timestamp: new Date().toISOString(),
        dashboardUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        priorityColor: this.getPriorityColor(emailData.data.priority),
        statusColor: this.getStatusColor(emailData.data.status)
      };

      const html = this.replaceTemplateVariables(template.html, templateData);
      const text = this.replaceTemplateVariables(template.text, templateData);

      const mailOptions = {
        from: `"TCC System" <${process.env.SMTP_USER}>`,
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: this.replaceTemplateVariables(template.subject, templateData),
        text: text,
        html: html,
        priority: emailData.priority === 'high' ? 'high' as const : 'normal' as const
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('TCC_DEBUG: Email sent successfully:', {
        messageId: (result as any).messageId,
        to: emailData.to,
        template: emailData.template
      });

      // Log email delivery
      await this.logEmailDelivery({
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: mailOptions.subject,
        template: emailData.template,
        messageId: (result as any).messageId,
        status: 'sent',
        tripId: emailData.data.tripId
      });

      return true;
    } catch (error) {
      console.error('TCC_DEBUG: Email sending failed:', error);
      
      // Log email failure
      await this.logEmailDelivery({
        to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
        subject: emailData.template,
        template: emailData.template,
        messageId: null,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        tripId: emailData.data.tripId
      });

      return false;
    }
  }

  private async logEmailDelivery(data: {
    to: string;
    subject: string;
    template: string;
    messageId: string | null;
    status: 'sent' | 'failed';
    error?: string;
    tripId?: string;
  }) {
    try {
      await centerPrisma.systemAnalytics.create({
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
      });
    } catch (error) {
      console.error('TCC_DEBUG: Failed to log email delivery:', error);
    }
  }

  async sendNewTripNotification(tripData: any, agencyEmails: string[]): Promise<boolean> {
    if (!agencyEmails.length) {
      console.log('TCC_DEBUG: No agency emails provided for trip notification');
      return false;
    }

    return await this.sendEmail({
      to: agencyEmails,
      template: 'newTripRequest',
      data: {
        tripId: tripData.id,
        patientId: tripData.patientId,
        transportLevel: tripData.transportLevel,
        priority: tripData.priority,
        originFacility: tripData.originFacility?.name || 'Unknown',
        destinationFacility: tripData.destinationFacility?.name || 'Unknown',
        readyStart: new Date(tripData.readyStart).toLocaleString(),
        readyEnd: new Date(tripData.readyEnd).toLocaleString(),
        specialRequirements: tripData.specialRequirements,
        isolation: tripData.isolation,
        bariatric: tripData.bariatric
      },
      priority: tripData.priority === 'URGENT' ? 'high' : 'normal'
    });
  }

  async sendTripAcceptedNotification(tripData: any, hospitalEmail: string): Promise<boolean> {
    return await this.sendEmail({
      to: hospitalEmail,
      template: 'tripAccepted',
      data: {
        tripId: tripData.id,
        patientId: tripData.patientId,
        agencyName: tripData.assignedAgency?.name || 'Unknown Agency',
        unitNumber: tripData.assignedUnit?.unitNumber || 'TBD',
        eta: tripData.eta || 'TBD',
        contactPhone: tripData.assignedAgency?.phone || 'Contact TCC'
      }
    });
  }

  async sendTripStatusUpdate(tripData: any, hospitalEmail: string, notes?: string): Promise<boolean> {
    return await this.sendEmail({
      to: hospitalEmail,
      template: 'tripStatusUpdate',
      data: {
        tripId: tripData.id,
        patientId: tripData.patientId,
        status: tripData.status,
        updatedAt: new Date(tripData.updatedAt).toLocaleString(),
        notes: notes
      }
    });
  }

  async testEmailConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('TCC_DEBUG: Email service connection verified');
      return true;
    } catch (error) {
      console.error('TCC_DEBUG: Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
