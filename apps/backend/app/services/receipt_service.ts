import env from '#start/env'

type ScannedItem = {
  name: string
  quantity: number
  price?: number
  category?: string
  expirationDate?: string // Format YYYY-MM-DD
}

interface OpenAIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

export default class ReceiptService {
  private apiKey = env.get('OPENAI_API_KEY')
  private apiUrl = 'https://api.openai.com/v1/chat/completions'

  /**
   * Analyse a receipt image and extract items
   * @param imageBase64 The base64 encoded image of the receipt (with data URI prefix or without, we'll handle it)
   */
  async parseReceipt(imageBase64: string): Promise<ScannedItem[]> {
    // Ensure we have a pure base64 string
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    const prompt = `
    Tu es un assistant expert en extraction de données de tickets de caisse.
    Analyse cette image de ticket de caisse et extrais la liste des produits alimentaires achetés.
    Pour chaque produit, devine une catégorie appropriée (ex: "Légumes", "Viande", "Laitages", "Boissons", "Epicerie", etc.) et estime une date de péremption réaliste basée sur le type de produit (ex: 3-5 jours pour viande, 7-10 jours pour laitages, etc.) à partir d'aujourd'hui (${new Date().toISOString().split('T')[0]}).
    
    Retourne UNIQUEMENT un tableau JSON valide sans Markdown, avec cette structure pour chaque item :
    [
      {
        "name": "Nom du produit nettoyé",
        "quantity": 1, // Nombre d'unités
        "price": 2.50, // Prix total pour cet item (optionnel)
        "category": "Catégorie",
        "expirationDate": "YYYY-MM-DD"
      }
    ]
    
    Ignore les produits non alimentaires (journaux, sacs poubelle, etc.).
    Si tu ne peux pas lire le ticket, retourne un tableau vide [].
    `

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OpenAI API Error:', errorText)
        throw new Error(`Erreur API OpenAI: ${response.statusText}`)
      }

      const data = (await response.json()) as OpenAIResponse
      
      if (!data.choices || data.choices.length === 0) {
        return []
      }

      const content = data.choices[0].message.content || '[]'
      
      // Attempt to clean markdown if present
      const jsonStr = content.replace(/```json\n?|\n?```/g, '').trim()
      
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('Error parsing receipt:', error)
      throw new Error('Impossible d\'analyser le ticket de caisse. Veuillez réessayer.')
    }
  }
}
