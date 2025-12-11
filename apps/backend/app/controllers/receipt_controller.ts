import type { HttpContext } from '@adonisjs/core/http'
import ReceiptService from '#services/receipt_service'
import vine from '@vinejs/vine'

const scanSchema = vine.object({
  image: vine.string(), // Base64 string
})

export default class ReceiptController {
  private receiptService: ReceiptService

  constructor() {
    this.receiptService = new ReceiptService()
  }

  /**
   * Scan a receipt and return extracted items
   * POST /api/v1/receipts/scan
   */
  async scan({ request, response }: HttpContext) {
    const data = await vine.validate({ schema: scanSchema, data: request.all() })

    try {
      const items = await this.receiptService.parseReceipt(data.image)
      
      return response.ok({
        message: 'Ticket analysé avec succès',
        items,
      })
    } catch (error) {
      return response.badRequest({
        message: error.message || 'Erreur lors de l\'analyse du ticket',
      })
    }
  }
}
