import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { facts } = await request.json()

  if (!facts || facts.length === 0) {
    return Response.json({ error: 'No facts provided' }, { status: 400 })
  }

  const client = new Anthropic()

  const factList = facts
    .map((f: { content: string; member_name: string }, i: number) =>
      `${i + 1}. "${f.content}" — oleh ${f.member_name}`
    )
    .join('\n')

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Kamu adalah juri untuk kompetisi fakta menarik tim TIJE Design Team TransJakarta. Setiap hari anggota tim menyerahkan satu fakta unik/menarik dan anggota lain memilih favorit mereka.

Berikut fakta-fakta yang disubmit hari ini:
${factList}

Evaluasi setiap fakta berdasarkan:
1. Seberapa menarik/mengejutkan (interest_score: 1-10)
2. Seberapa mungkin faktanya benar (accuracy: "Tinggi" / "Sedang" / "Rendah")
3. Komentar singkat dalam bahasa Indonesia (max 10 kata)

Lalu pilih 1 fakta terbaik secara keseluruhan (kombinasi paling menarik + paling mungkin benar) dan berikan alasan singkat dalam bahasa Indonesia (1 kalimat, max 15 kata).

Balas HANYA dengan JSON valid berikut, tanpa teks lain:
{
  "evaluations": [
    { "member_name": "...", "interest_score": 8, "accuracy": "Tinggi", "comment": "..." }
  ],
  "winner": {
    "member_name": "...",
    "reason": "..."
  }
}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)

  if (!jsonMatch) {
    return Response.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  try {
    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch {
    return Response.json({ error: 'Invalid JSON from AI' }, { status: 500 })
  }
}
