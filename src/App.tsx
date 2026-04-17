import { FormEvent, useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import './App.css'

const normalizeUrl = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    throw new Error('empty-url')
  }

  const hasProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmedValue)
  const candidate = hasProtocol ? trimmedValue : `https://${trimmedValue}`
  const parsedUrl = new URL(candidate)

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('invalid-protocol')
  }

  return parsedUrl.toString()
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [inputUrl, setInputUrl] = useState('')
  const [generatedUrl, setGeneratedUrl] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState(
    'Insira um link para gerar um QR Code com visual pronto para compartilhar.',
  )
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (!generatedUrl || !canvasRef.current) {
      return
    }

    let isMounted = true
    const canvas = canvasRef.current

    setIsGenerating(true)

    void QRCode.toCanvas(canvas, generatedUrl, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#d51f29',
        light: '#fffaf7',
      },
    })
      .then(() => {
        if (!isMounted) {
          return
        }

        setStatusMessage('QR Code gerado com sucesso. Agora voce pode baixar o PNG.')
      })
      .catch(() => {
        if (!isMounted) {
          return
        }

        setErrorMessage('Nao foi possivel gerar o QR Code para esse link.')
        setStatusMessage('Tente novamente com outro link.')
      })
      .finally(() => {
        if (isMounted) {
          setIsGenerating(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [generatedUrl])

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const normalizedUrl = normalizeUrl(inputUrl)

      setErrorMessage('')
      setInputUrl(normalizedUrl)
      setGeneratedUrl(normalizedUrl)
      setStatusMessage('Gerando QR Code...')
    } catch {
      setErrorMessage('Informe um link valido. Exemplo: https://www.sp.senai.br')
      setStatusMessage(
        generatedUrl
          ? 'O ultimo QR valido continua disponivel para download.'
          : 'Nenhum QR Code foi gerado ainda.',
      )
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current || !generatedUrl) {
      return
    }

    const downloadLink = document.createElement('a')
    downloadLink.href = canvasRef.current.toDataURL('image/png')
    downloadLink.download = 'senai-qrcode.png'
    downloadLink.click()
  }

  const previewDomain = generatedUrl
    ? new URL(generatedUrl).hostname.replace(/^www\./, '')
    : 'seu-link.com'

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <p className="brand-kicker">SENAI QR CODE</p>
            <p className="brand-subtitle">Gerador minimalista para links compartilhaveis</p>
          </div>
        </div>
        <p className="topbar-note">Interface limpa, direta e pronta para deploy.</p>
      </header>

      <main className="workspace">
        <section className="content-column">
          <p className="eyebrow">Atividade de sistemas web</p>
          <h1>Transforme qualquer link em um QR Code elegante.</h1>
          <p className="lead">
            Gere, visualize e baixe um QR Code em segundos com identidade visual inspirada
            no tema SENAI.
          </p>

          <form className="generator-form" onSubmit={handleGenerate}>
            <label className="field-label" htmlFor="url">
              Link para converter
            </label>

            <div className="field-group">
              <input
                id="url"
                name="url"
                type="text"
                inputMode="url"
                autoComplete="url"
                value={inputUrl}
                onChange={(event) => setInputUrl(event.target.value)}
                placeholder="https://www.sp.senai.br"
                aria-invalid={Boolean(errorMessage)}
              />
              <button className="primary-button" type="submit">
                Gerar QR Code
              </button>
            </div>

            <p className={`feedback ${errorMessage ? 'feedback-error' : 'feedback-neutral'}`}>
              {errorMessage || 'Links sem protocolo recebem https:// automaticamente.'}
            </p>

            <div className="action-row">
              <button
                className="secondary-button"
                type="button"
                onClick={handleDownload}
                disabled={!generatedUrl || isGenerating}
              >
                Baixar PNG
              </button>
              <p className="status-text" aria-live="polite">
                {statusMessage}
              </p>
            </div>
          </form>

          <div className="detail-strip" aria-label="Recursos principais">
            <span>Preview imediato</span>
            <span>Download em PNG</span>
            <span>Validacao de link</span>
          </div>
        </section>

        <section className="preview-column" aria-live="polite">
          <div className="preview-stage">
            <div className="preview-orbit preview-orbit-a" aria-hidden="true" />
            <div className="preview-orbit preview-orbit-b" aria-hidden="true" />
            <div className="preview-frame">
              {generatedUrl ? (
                <canvas ref={canvasRef} className="qr-canvas" />
              ) : (
                <div className="preview-placeholder">
                  <div className="placeholder-grid" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <p>Aguardando um link valido para montar o QR Code.</p>
                </div>
              )}
            </div>
          </div>

          <div className="preview-meta">
            <p className="meta-label">Destino atual</p>
            <p className="meta-value">{previewDomain}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
