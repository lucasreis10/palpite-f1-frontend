# 🔄 Integração Frontend-Backend: Upload de Excel

Este documento explica como integrar o sistema de upload de Excel entre o frontend Next.js e o backend Java Spring Boot.

## 🏗️ Arquitetura da Solução

```
┌─────────────────────┐    📤 Upload Excel    ┌─────────────────────┐
│   Frontend Next.js  │ ────────────────────► │   Backend Java      │
│   (palpite-f1)      │                       │ (palpite-f1-backend)│
└─────────────────────┘                       └─────────────────────┘
         │                                              │
         │ 1. Interface de Upload                       │ 2. Processamento
         │ 2. Validação de arquivo                      │ 3. Leitura Excel
         │ 3. Envio para backend                        │ 4. Inserção no BD
         │ 4. Exibição de resultados                    │ 5. Retorno de stats
```

## 📁 Arquivos Criados

### 🎨 Frontend (Next.js)
```
src/app/
├── admin/
│   ├── page.tsx                    # Dashboard administrativo
│   └── upload/
│       └── page.tsx                # Interface de upload
└── api/
    └── upload/
        └── excel/
            └── route.ts            # Proxy para backend Java
```

### 🔧 Backend (Java Spring Boot)
```
src/main/java/.../
├── controllers/
│   └── ImportController.java       # Controller para upload
└── domain/imports/
    ├── ImportResponse.java         # Classe de resposta
    └── ExcelImportService.java     # Serviço de processamento
```

## 🚀 Como Configurar

### 1. Backend Java - Dependências

Adicione ao `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Apache POI para Excel -->
    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi</artifactId>
        <version>5.2.4</version>
    </dependency>
    <dependency>
        <groupId>org.apache.poi</groupId>
        <artifactId>poi-ooxml</artifactId>
        <version>5.2.4</version>
    </dependency>
    
    <!-- Lombok (opcional) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
</dependencies>
```

### 2. Backend Java - Ativar Classes

Descomente as anotações nos arquivos:

**ImportController.java:**
```java
@Slf4j
@RestController
@RequestMapping("/import")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class ImportController {
    // ... código
}
```

**ExcelImportService.java:**
```java
@Service
public class ExcelImportService {
    // ... código
}
```

### 3. Frontend - Configurar URL do Backend

No arquivo `.env.local`:
```bash
BACKEND_URL=http://localhost:8080
```

Ou ajuste diretamente em `src/app/api/upload/excel/route.ts`:
```typescript
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
```

## 🔌 Endpoints da API

### Backend Java

#### `POST /import/excel`
Processa arquivo Excel com palpites históricos.

**Request:**
```bash
curl -X POST \
  -F "excel=@palpites.xlsx" \
  http://localhost:8080/import/excel
```

**Response:**
```json
{
  "success": true,
  "message": "Processamento concluído! 54 usuários, 1248 palpites em 1234ms",
  "processedAt": "2024-01-15T10:30:00",
  "stats": {
    "totalUsers": 54,
    "totalGuesses": 1248,
    "totalRaces": 24,
    "qualifyingGuesses": 624,
    "raceGuesses": 624,
    "unmappedPilots": 3,
    "createdUsers": 54,
    "createdGuesses": 1248,
    "processingTimeMs": 1234
  }
}
```

#### `GET /import/test`
Testa se o serviço está funcionando.

#### `GET /import/info`
Retorna informações sobre o serviço.

### Frontend Next.js

#### `POST /api/upload/excel`
Proxy que encaminha arquivo para o backend Java.

#### `GET /api/upload/excel`
Retorna informações sobre a conexão com o backend.

## 🎯 Fluxo Completo

### 1. Usuário Upload Arquivo
```
1. Usuário acessa http://localhost:3000/admin/upload
2. Arrasta arquivo Excel para a área de upload
3. Clica em "Processar Arquivo"
```

### 2. Frontend Processa Request
```typescript
// src/app/admin/upload/page.tsx
const processFile = async () => {
  const formData = new FormData();
  formData.append('excel', uploadedFile);

  const response = await fetch('/api/upload/excel', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  setResult(result);
};
```

### 3. Frontend Encaminha para Backend
```typescript
// src/app/api/upload/excel/route.ts
const backendFormData = new FormData();
backendFormData.append('excel', file);

const backendResponse = await fetch(`${BACKEND_URL}/import/excel`, {
  method: 'POST',
  body: backendFormData,
});
```

### 4. Backend Processa Excel
```java
// ImportController.java
@PostMapping("/excel")
public ResponseEntity<ImportResponse> importExcel(@RequestParam("excel") MultipartFile file) {
    ImportResponse result = excelImportService.processExcelFile(file);
    return ResponseEntity.ok(result);
}
```

### 5. Backend Retorna Resultado
```java
// ExcelImportService.java
public ImportResponse processExcelFile(MultipartFile file) {
    // 1. Lê arquivo Excel
    // 2. Processa aba "Palpite"
    // 3. Mapeia pilotos e corridas
    // 4. Salva no banco de dados
    // 5. Retorna estatísticas
}
```

### 6. Frontend Exibe Resultado
```typescript
// Exibe estatísticas visuais
// Permite download dos dados processados
// Mostra próximos passos
```

## 🗄️ Integração com Banco de Dados

O backend deve salvar os dados nas tabelas existentes:

```sql
-- Usuários
INSERT INTO users (name, email, password, role, active) VALUES ...

-- Palpites
INSERT INTO guesses (user_id, grand_prix_id, guess_type, score, calculated, active) VALUES ...

-- Pilotos dos palpites
INSERT INTO guess_pilots (guess_id, pilot_id, position) VALUES ...
```

## 🚨 Tratamento de Erros

### Conexão Backend Indisponível
```json
{
  "success": false,
  "message": "Erro de conexão com o backend. Verifique se o servidor Java está rodando.",
  "error": "Backend não disponível",
  "backendUrl": "http://localhost:8080"
}
```

### Arquivo Excel Inválido
```json
{
  "success": false,
  "message": "Aba 'Palpite' não encontrada no arquivo Excel"
}
```

### Erro de Processamento
```json
{
  "success": false,
  "message": "Erro durante processamento: Invalid file format"
}
```

## 🧪 Como Testar

### 1. Testar Backend Isoladamente
```bash
# Verificar se backend está rodando
curl http://localhost:8080/import/test

# Testar upload direto
curl -X POST \
  -F "excel=@test.xlsx" \
  http://localhost:8080/import/excel
```

### 2. Testar Frontend Isoladamente
```bash
# Verificar se frontend está rodando
curl http://localhost:3000/api/upload/excel

# Acessar interface
open http://localhost:3000/admin/upload
```

### 3. Testar Integração Completa
```bash
# 1. Iniciar backend Java
cd palpite-f1-backend && ./mvnw spring-boot:run

# 2. Iniciar frontend Next.js
cd palpite-f1 && npm run dev

# 3. Acessar http://localhost:3000/admin/upload
# 4. Fazer upload de arquivo Excel
```

## 📊 Monitoramento

### Logs do Backend
```
📁 Recebido arquivo Excel para import: palpites.xlsx (2.3MB)
🏁 Corridas identificadas: 24 corridas
👤 Usuário: Anderson Simões
✅ Import concluído com sucesso: 54 usuários, 1248 palpites
```

### Logs do Frontend
```
🔄 Enviando arquivo Excel para backend Java: palpites.xlsx
✅ Resposta do backend Java recebida
```

## 🔧 Configurações Avançadas

### CORS (Cross-Origin Resource Sharing)
```java
@CrossOrigin(origins = "*", allowedHeaders = "*")
```

### Tamanho Máximo de Arquivo
```properties
# application.properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Timeout de Requisição
```typescript
const backendResponse = await fetch(`${BACKEND_URL}/import/excel`, {
  method: 'POST',
  body: backendFormData,
  signal: AbortSignal.timeout(30000) // 30 segundos
});
```

## 🚀 Próximos Passos

1. **Configurar dependências** no backend Java
2. **Testar conexão** entre frontend e backend
3. **Implementar salvamento** real no banco de dados
4. **Adicionar validações** mais robustas
5. **Implementar sistema de logs** detalhado
6. **Criar testes automatizados** para a integração

---

**Status**: ✅ Integração implementada - pronta para configuração das dependências

**Suporte**: Siga as instruções deste documento para ativar a funcionalidade completa 