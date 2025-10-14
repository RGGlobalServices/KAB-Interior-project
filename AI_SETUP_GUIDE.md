# 🤖 AI Design Assistant Setup Guide

## Overview

Your AI Interior Design application now includes **real-time AI features** powered by OpenAI's GPT-4. This guide will help you set up the OpenAI API to enable all AI capabilities.

---

## ✨ Available AI Features

### 1. **Comprehensive Project Analysis** 🔍
- Detailed space planning recommendations
- Design assessment and optimization suggestions
- Layout and flow analysis
- Professional design insights based on uploaded files

### 2. **AI Color Palette Generator** 🎨
- Custom color schemes for any design style
- Room-specific color recommendations
- Hex codes and usage guidance
- Cohesive palette explanations

### 3. **Material & Finish Recommendations** 🏗️
- Budget-conscious material options (low/medium/high)
- Sustainability-focused alternatives
- Durability and maintenance information
- Flooring, countertops, cabinetry, and hardware suggestions

### 4. **Cost Estimation & Budgeting** 💰
- Detailed budget breakdowns by category
- Cost-saving alternatives
- Timeline estimates
- Value engineering suggestions

### 5. **Quick Design Help** 💡
- Instant answers to design questions
- Professional design advice
- No project required

### 6. **Q&A with Context** 💬
- Ask questions about specific projects
- AI analyzes uploaded PDF files
- Context-aware responses

---

## 🔧 Setup Instructions

### Step 1: Get Your OpenAI API Key

1. **Sign up for OpenAI:**
   - Go to https://platform.openai.com/
   - Create an account or log in

2. **Create an API Key:**
   - Navigate to https://platform.openai.com/api-keys
   - Click "Create new secret key"
   - Give it a name (e.g., "Interior Design App")
   - **Copy the key immediately** (you won't be able to see it again)
   - It looks like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Add Credit to Your Account:**
   - Go to https://platform.openai.com/account/billing
   - Add a payment method
   - Purchase credits (start with $5-$10 for testing)

### Step 2: Configure Your Application

#### Option A: Using Environment Variable (Recommended)

**Windows (PowerShell):**
```powershell
# Set for current session
$env:OPENAI_API_KEY="sk-proj-your-actual-key-here"

# Set permanently (requires new terminal)
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-proj-your-actual-key-here', 'User')
```

**Windows (Command Prompt):**
```cmd
setx OPENAI_API_KEY "sk-proj-your-actual-key-here"
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export OPENAI_API_KEY="sk-proj-your-actual-key-here"

# Then reload
source ~/.bashrc  # or source ~/.zshrc
```

#### Option B: Using .env File

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and add your API key:
   ```env
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```

3. **Important:** Never commit `.env` to git (it's already in `.gitignore`)

### Step 3: Restart Your Application

```bash
# Stop the Flask server (Ctrl+C)
# Then restart it
python app.py
```

### Step 4: Test the AI Features

1. Open your browser and go to `http://localhost:5000`
2. Log in or register
3. Open any project
4. Click the **"AI Assistant"** tab
5. Click **"Launch AI Design Assistant"**
6. Try any of the features:
   - **Project Analysis**: Get instant AI analysis
   - **Color Palette**: Generate custom color schemes
   - **Materials**: Get material recommendations
   - **Cost Estimate**: Generate budget estimates
   - **Quick Help**: Ask any design question

---

## 💰 Cost Information

### Pricing (as of 2024)

- **GPT-4 Input:** ~$0.03 per 1K tokens (~750 words)
- **GPT-4 Output:** ~$0.06 per 1K tokens

### Typical Costs Per Request

- **Project Analysis**: $0.10 - $0.20
- **Color Palette**: $0.05 - $0.10
- **Material Recommendations**: $0.08 - $0.15
- **Cost Estimate**: $0.10 - $0.20
- **Quick Suggestion**: $0.03 - $0.08
- **Q&A**: $0.05 - $0.15

**Example:** $10 in credits = ~50-100 comprehensive analyses

### Cost Optimization Tips

1. **Start Small**: Test with a small credit amount ($5-$10)
2. **Monitor Usage**: Check your usage at https://platform.openai.com/usage
3. **Set Limits**: Set monthly spending limits in your OpenAI account
4. **Cache Results**: Save AI responses for similar questions

---

## 🔒 Security Best Practices

1. **Never Share Your API Key**
   - Don't commit it to git
   - Don't share it in screenshots
   - Don't post it in public forums

2. **Use Environment Variables**
   - Store the key in `.env` or system environment variables
   - Never hardcode it in your code

3. **Rotate Keys Regularly**
   - Create new keys periodically
   - Delete old/unused keys

4. **Set Usage Limits**
   - Configure soft and hard limits in OpenAI dashboard
   - Monitor for unusual activity

---

## 🧪 Testing Without OpenAI API

If you don't have an OpenAI API key yet, the system will still work with fallback responses:

```
"AI features require OpenAI API configuration. This is a simulated response..."
```

This allows you to test the UI and flow without incurring costs.

---

## 🐛 Troubleshooting

### "OpenAI API not configured" Error

**Solution:**
1. Verify your API key is set correctly
2. Restart the Flask server after setting the environment variable
3. Check that the key starts with `sk-proj-` or `sk-`

### "Insufficient Credits" Error

**Solution:**
1. Go to https://platform.openai.com/account/billing
2. Add a payment method and purchase credits
3. Wait a few minutes for the credits to be available

### "Rate Limit Exceeded" Error

**Solution:**
1. You're making requests too quickly
2. Wait a minute and try again
3. Consider upgrading your OpenAI plan for higher limits

### "Invalid API Key" Error

**Solution:**
1. Double-check your API key (no extra spaces)
2. Make sure the key hasn't been deleted from OpenAI dashboard
3. Generate a new key if needed

---

## 📊 API Usage Monitoring

### Check Your Usage

1. Go to https://platform.openai.com/usage
2. View daily/monthly usage
3. See costs broken down by model

### Set Up Alerts

1. Go to https://platform.openai.com/account/billing
2. Set up monthly budget alerts
3. Configure email notifications

---

## 🚀 Advanced Configuration

### Custom Model Selection

Edit `routes/ai_design.py` to use different models:

```python
# Use GPT-3.5-Turbo (cheaper, faster, less capable)
model="gpt-3.5-turbo"

# Use GPT-4 (default, more expensive, more capable)
model="gpt-4"

# Use GPT-4-Turbo (good balance)
model="gpt-4-turbo-preview"
```

### Adjust Token Limits

```python
# Increase for longer responses
max_tokens=1500  # Default for analysis

# Decrease for shorter responses (lower cost)
max_tokens=300
```

### Adjust Temperature (Creativity)

```python
# More creative/varied responses
temperature=0.9

# More focused/consistent responses
temperature=0.5
```

---

## 📚 Additional Resources

- **OpenAI Documentation**: https://platform.openai.com/docs
- **API Reference**: https://platform.openai.com/docs/api-reference
- **Pricing**: https://openai.com/pricing
- **Best Practices**: https://platform.openai.com/docs/guides/production-best-practices

---

## ✅ Quick Start Checklist

- [ ] Create OpenAI account
- [ ] Generate API key
- [ ] Add payment method and credits
- [ ] Set `OPENAI_API_KEY` environment variable
- [ ] Restart Flask application
- [ ] Test AI features in the app
- [ ] Set up usage alerts
- [ ] Bookmark OpenAI usage dashboard

---

## 🎉 You're Ready!

Once your API key is configured, all AI features will work in real-time:

- ✅ Comprehensive project analysis
- ✅ AI-generated color palettes
- ✅ Smart material recommendations
- ✅ Accurate cost estimates
- ✅ Instant design suggestions
- ✅ Context-aware Q&A

Enjoy your AI-powered interior design assistant! 🎨✨

