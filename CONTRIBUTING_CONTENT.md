# Contributing Content to LoreWeaver

Thank you for your interest in contributing content to LoreWeaver! This guide will walk you through the process of creating and submitting high-quality encounters, locations, NPCs, skill checks, and dangers.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Content Submission Workflow](#content-submission-workflow)
3. [Content Types](#content-types)
4. [Validation](#validation)
5. [Best Practices](#best-practices)
6. [Style Guide](#style-guide)
7. [Common Issues](#common-issues)

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Git
- Text editor (VS Code recommended)
- Basic understanding of JSON

### Setup

1. **Fork and clone the repository:**
   ```bash
   git fork https://github.com/alekzandr/loreweaver.git
   cd loreweaver
   npm install
   ```

2. **Create a new branch:**
   ```bash
   git checkout -b content/your-content-name
   ```

3. **Copy a template from `/examples/`:**
   ```bash
   cp examples/encounter-template.json content-submissions/encounters/your-encounter.json
   ```

4. **Edit your content** using the template as a guide

5. **Validate locally:**
   ```bash
   npm run validate:content
   ```

6. **Submit a pull request** when all validations pass

---

## 🔄 Content Submission Workflow

```
1. Create Branch → 2. Add Content → 3. Validate → 4. Test → 5. PR → 6. Review → 7. Merge
```

### Detailed Steps

1. **Create a feature branch** with descriptive name:
   - `content/urban-marketplace-encounter`
   - `content/haunted-library-location`
   - `content/goblin-clan-npcs`

2. **Add your JSON file** to the appropriate directory:
   - `content-submissions/encounters/` - for encounters
   - `content-submissions/locations/` - for locations
   - `content-submissions/npcs/` - for NPC content
   - `content-submissions/skillchecks/` - for skill checks
   - `content-submissions/dangers/` - for traps and hazards

3. **Validate your content:**
   ```bash
   # Validate everything
   npm run validate:content
   
   # Validate specific file
   npm run validate:content content-submissions/encounters/my-encounter.json
   ```

4. **Test in the app (optional but recommended):**
   - Temporarily copy your content to the production JSON
   - Run `npm start`
   - Test the encounter/location in the generator

5. **Create a Pull Request:**
   - Descriptive title: "Add: [Content Type] - [Name]"
   - Description: Brief summary of the content
   - Wait for automated CI validation
   - Address any reviewer feedback

---

## 📝 Content Types

### 1. Encounters

**Location:** `content-submissions/encounters/`  
**Schema:** `schemas/encounter-schema.json`  
**Template:** `examples/encounter-template.json`

Encounters are complete adventure scenarios with setup, complications, and multiple possible resolutions.

**Required Fields:**
- `title` (string): Unique, descriptive title (3-100 chars)
- `tags` (array): 2-10 searchable tags
- `descriptions` (array): 2-4 evocative descriptions (100-1000 chars each)
- `weight` (number): Selection weight 0.5-2.0 (default 1.0)
- `resolutions` (array): 2-3 possible endings

**Optional Fields:**
- `environment` (string): Target environment (urban/undercity/wilderness/dungeon/planar)
- `customLocations` (array): Specific location keys for this encounter

**Example:**
```json
{
  "title": "The Midnight Market",
  "environment": "urban",
  "tags": ["market", "night", "trading", "mysterious"],
  "descriptions": [
    "Lanterns flicker to life as darkness falls...",
    "Vendors emerge from shadows with impossible wares..."
  ],
  "weight": 1.2,
  "resolutions": [
    {
      "title": "Bargain Struck",
      "description": "...",
      "requirements": "Persuasion DC 15",
      "rewards": "Rare item, merchant contact"
    }
  ]
}
```

### 2. Locations

**Location:** `content-submissions/locations/`  
**Schema:** `schemas/location-schema.json`  
**Template:** `examples/location-template.json`

Locations use progressive reveal system: primary (obvious), secondary (inspection), tertiary (hidden).

**Required Fields:**
- `key` (string): Unique identifier (lowercase-with-hyphens)
- `tags` (array): 2-8 categorization tags
- `primary` (array): 6-15 immediately visible details
- `secondary` (array): 6-15 details requiring closer look
- `tertiary` (array): 4-12 hidden/secret details

**Optional Fields:**
- `name` (string): Human-readable name (auto-generated from key if omitted)
- `environment` (string): Environment this location belongs to

**Progressive Reveal Guidelines:**
- **Primary:** What anyone can see at a glance (furniture, architecture, obvious features)
- **Secondary:** Details requiring a moment of attention (scratches, stains, small objects)
- **Tertiary:** Hidden secrets (concealed doors, trapped items, valuable treasures)

### 3. NPCs

**Location:** `content-submissions/npcs/`  
**Schema:** `schemas/npc-schema.json`  
**Templates:** `examples/npc-species-template.json`, `examples/npc-profession-template.json`

NPCs come in four types: Species, Professions, Alignments, and Personalities.

#### Species

```json
{
  "type": "species",
  "key": "dragonborn",
  "tags": ["draconic", "noble", "honorable"],
  "firstNames": ["Arjhan", "Balasar", ...],
  "surnames": ["Clethtinthiallor", "Daardendrian", ...]
}
```

- **firstNames:** 15-50 names (capitalize first letter)
- **surnames:** 15-50 names (capitalize first letter)
- Use culturally appropriate naming conventions

#### Professions

```json
{
  "type": "profession",
  "name": "Blacksmith",
  "tags": ["crafting", "metal", "strength", "urban", "forge"]
}
```

- Include environment tags where profession is typically found
- Add activity/skill tags (crafting, social, combat, etc.)

### 4. Skill Checks

**Location:** `content-submissions/skillchecks/`  
**Schema:** `schemas/skillcheck-schema.json`  
**Template:** `examples/skillcheck-template.json`

Skill checks are reusable challenges for any D&D 5e skill.

**Required Fields:**
- `skill` (enum): One of the 18 D&D 5e skills
- `challenge` (string): Brief description (10-100 chars)
- `description` (string): DM context (30-300 chars)
- `success` (string): Success outcome (10-200 chars)
- `failure` (string): Failure outcome (10-200 chars)
- `tags` (array): 3-10 categorization tags

**Optional:**
- `dc` (number): Suggested DC 5-30

### 5. Dangers (Traps & Hazards)

**Location:** `content-submissions/dangers/`  
**Schema:** `schemas/danger-schema.json`  
**Templates:** `examples/danger-trap-template.json`, `examples/danger-hazard-template.json`

#### Traps

```json
{
  "category": "trap",
  "name": "Poison Dart Trap",
  "description": "...",
  "detectMethod": "Perception DC 15",
  "disarmMethod": "Thieves' Tools DC 13",
  "damageType": "poison",
  "damage": "2d8",
  "tags": ["mechanical", "dungeon", "ancient"],
  "severity": "medium",
  "resetable": true
}
```

#### Hazards

```json
{
  "category": "hazard",
  "name": "Unstable Floor",
  "description": "...",
  "effect": "...",
  "avoidMethod": "...",
  "tags": ["environmental", "structural", "dangerous"],
  "severity": "high",
  "recurring": false
}
```

---

## ✅ Validation

### Local Validation

Always validate before submitting:

```bash
# Validate all submissions
npm run validate:content

# Validate specific file
npm run validate:content content-submissions/encounters/my-encounter.json

# Validate directory
npm run validate:content content-submissions/encounters/
```

### What Gets Validated

1. **JSON Syntax:** Proper formatting, no trailing commas
2. **Schema Compliance:** All required fields present, correct types
3. **Field Constraints:** String lengths, array sizes, enum values
4. **Duplicate IDs:** No duplicate titles, keys, or names
5. **Tag Consistency:** Lowercase, hyphenated format
6. **Custom Rules:** Content-specific validation logic

### Common Validation Errors

```
❌ "title" must be between 3 and 100 characters
✅ Fix: Adjust title length

❌ "tags" must contain at least 2 items
✅ Fix: Add more relevant tags

❌ "weight" must be between 0.5 and 2.0
✅ Fix: Adjust weight to reasonable value

❌ Duplicate encounter title: "The Dark Alley"
✅ Fix: Make title unique or modify existing

❌ "environment" must be one of: urban, undercity, wilderness, dungeon, planar
✅ Fix: Use exact environment name
```

### Advanced Validation Options

The validation script supports several command-line options for enhanced checking:

#### Auto-Fix (`--fix`)

Automatically fixes common formatting issues:

```bash
npm run validate:content -- --fix
```

**Auto-fixes include:**
- Trimming whitespace from all strings
- Converting tags to lowercase-hyphenated format
- Normalizing location/NPC keys to proper format
- Clamping encounter weights to valid range (0.5-2.0)

#### Detailed Reports (`--report`)

Generate comprehensive validation reports with warnings and suggestions:

```bash
npm run validate:content -- --report
```

**Report includes:**
- Quality warnings (description length, tag usage, etc.)
- Improvement suggestions for content quality
- Best practice recommendations

#### Production Cross-Check (`--check-production`)

Validate against existing production data to avoid duplicates:

```bash
npm run validate:content -- --check-production
```

**Checks for:**
- Duplicate encounter titles
- Duplicate location keys  
- Duplicate NPC species keys
- Unknown tags not used in production

#### Combined Options

Use multiple flags together:

```bash
npm run validate:content -- --fix --report --check-production
```

---

## 🎯 Best Practices

### Content Quality

1. **Evocative Descriptions**
   - Use sensory details (sight, sound, smell, touch)
   - Show, don't tell
   - Create atmosphere and tension
   - Leave room for DM interpretation

2. **Multiple Options**
   - Provide 2-3 resolution paths minimum
   - Include moral complexity
   - Reward creative player solutions
   - Avoid railroading

3. **Appropriate Challenge**
   - Balance risk and reward
   - Consider party levels 1-20
   - Provide scaling guidance
   - Include failure states that advance story

### Writing Style

- **Active voice:** "The assassin strikes" not "The assassin is striking"
- **Present tense:** "You see..." not "You saw..."
- **Second person:** "Your hand touches..." not "The character's hand..."
- **Concise:** Every word earns its place
- **Evocative:** Paint mental pictures without purple prose

### Tags

Good tags are:
- ✅ Descriptive: `haunted`, `underground`, `social`
- ✅ Searchable: `combat`, `puzzle`, `roleplay`
- ✅ Environmental: `urban`, `forest`, `dungeon`
- ✅ Thematic: `mystery`, `horror`, `heist`

Bad tags are:
- ❌ Too specific: `blue-dragon-lair-level-15`
- ❌ Redundant: `big-large-huge`
- ❌ Vague: `interesting`, `cool`, `fun`

### Naming Conventions

**Encounters:**
- Descriptive, memorable titles
- Use "The" prefix for unique locations
- Capitalize major words
- Examples: "The Midnight Market", "Rooftop Chase", "Whispers in the Walls"

**Locations:**
- Lowercase keys with hyphens: `haunted-library`
- Names auto-generated from keys
- Or provide custom name: "The Whispering Archives"

**NPCs:**
- First names: Capital case, culturally appropriate
- Surnames: Match species/culture conventions
- Professions: Capitalize, single or compound words

---

## 📐 Style Guide

### JSON Formatting

```json
{
  "key": "value",
  "array": [
    "item1",
    "item2"
  ],
  "nested": {
    "property": "value"
  }
}
```

- **Indentation:** 2 spaces (not tabs)
- **Strings:** Use double quotes
- **No trailing commas**
- **UTF-8 encoding**
- **Unix line endings (LF)**

### Description Writing

**Good Example:**
> Rusted chains hang from hooks embedded in water-stained walls. The air tastes of salt and old blood. Somewhere in the darkness, water drips with the steady rhythm of a heartbeat. Your torchlight catches movement—rats, or something worse, scattered by your presence.

**What Makes It Good:**
- Multiple senses engaged (sight, taste, sound, implied touch)
- Creates atmosphere and tension
- Specific details (rusted, water-stained, steady rhythm)
- Implies danger without stating it
- Room for DM embellishment

**Bad Example:**
> You are in a dark room. There are chains on the walls. It smells bad. There might be rats.

**Problems:**
- Tells instead of shows
- Vague descriptions ("dark", "bad")
- No atmosphere or tension
- Past tense and passive voice
- Unengaging prose

---

## 🐛 Common Issues

### Issue: Validation Fails with "Unable to determine content type"

**Cause:** File is in wrong directory or missing type identifier

**Fix:**
- Ensure file is in correct subdirectory of `content-submissions/`
- For NPC content, include `"type": "species"` or `"type": "profession"`
- For dangers, include `"category": "trap"` or `"category": "hazard"`

### Issue: "Duplicate IDs found"

**Cause:** Your content has same title/key as existing content

**Fix:**
- Make your encounter title unique
- Choose a different location key
- Check existing content in `data/` directory

### Issue: Schema validation fails on tags

**Cause:** Tags don't match pattern `^[a-z][a-z-]*[a-z]$`

**Fix:**
- Use lowercase only
- Use hyphens (not underscores or spaces)
- Start and end with letters
- Examples: `ancient-ruins`, `high-magic`, `social-encounter`

### Issue: Description too long/short

**Cause:** Text doesn't meet min/max length requirements

**Fix:**
- Encounter descriptions: 100-1000 characters
- Location details: 2-100 characters
- Check schema for specific limits

### Issue: Missing required fields

**Cause:** JSON missing mandatory properties

**Fix:**
- Check schema for required fields (marked with `"required": [...]`)
- Compare your JSON to template file
- Ensure no typos in field names

---

## 📊 Content Checklist

Before submitting, verify:

- [ ] Content follows appropriate schema
- [ ] All required fields present
- [ ] Descriptions are evocative and detailed
- [ ] Tags are descriptive and lowercase
- [ ] Multiple options/variants provided (where applicable)
- [ ] No duplicate IDs with existing content
- [ ] JSON is properly formatted
- [ ] Local validation passes (`npm run validate:content`)
- [ ] Content tested in application (optional but recommended)
- [ ] Writing follows style guide
- [ ] Git branch has descriptive name
- [ ] Pull request has clear description

---

## 🤖 Automated Validation (CI/CD)

### GitHub Actions Integration

When you submit a pull request, **automated validation runs automatically**:

#### What Gets Validated

1. **JSON Syntax** - Ensures your files are valid JSON
2. **Schema Compliance** - Checks all required fields and data types
3. **Quality Checks** - Reviews tags, weights, descriptions, DCs
4. **Production Cross-Check** - Detects duplicate content
5. **Test Suite** - Runs full validation test suite

#### PR Validation Workflow

```
You submit PR → GitHub Actions runs validation → Results posted as PR comment
                                                           ↓
                                                    ✅ Pass → Merge allowed
                                                    ⚠️  Warnings → Merge allowed (consider fixing)
                                                    ❌ Fail → Merge blocked
```

#### Understanding PR Comments

After submitting your PR, a bot will comment with validation results:

**✅ All Validations Passed**
```markdown
## 🛡️ Content Validation Results

### ✅ All validations passed!
Your content submission looks great. No issues detected.
```
→ Your PR is ready to merge (after maintainer review)

**⚠️ Passed with Warnings**
```markdown
### ⚠️ Validation Passed with Warnings
Your content is valid but has some quality suggestions:

- Description could be more detailed (current: 75 chars, ideal: 100-500)
- Tag "ancient-ruins" not found in production (might be new)
- Weight 1.8 is high; consider 1.0-1.5 for balanced encounters
```
→ Your PR can merge, but consider addressing suggestions for better quality

**❌ Validation Failed**
```markdown
### ❌ Validation Failed
Please fix the following issues before merging:

- Missing required field: "description"
- Invalid DC value: 35 (must be 1-30)
- Duplicate content: "Goblin Ambush" already exists in production
```
→ You must fix errors and push updates before merge

#### Responding to Validation Failures

1. **Read the error message carefully**
   - Identifies the exact issue
   - Often suggests how to fix it

2. **Fix locally**
   ```bash
   # Use auto-fix for common issues
   npm run validate:content -- --fix
   
   # Or manually edit the file
   ```

3. **Validate locally**
   ```bash
   npm run validate:content -- --check-production --report
   ```

4. **Commit and push**
   ```bash
   git add content-submissions/
   git commit -m "fix: Address validation errors"
   git push
   ```

5. **Wait for re-validation**
   - Workflow runs automatically on new commits
   - Check PR comment for updated results

#### Tips for Passing CI

- **Validate locally first** - Catches issues before PR
- **Use auto-fix** - Fixes common formatting issues
- **Read schemas** - Understand what's required
- **Check examples** - Follow working patterns
- **Ask for help** - Comment on PR if stuck

### CI Won't Start?

If validation doesn't run on your PR:

1. **Check file paths** - Must be in `content-submissions/`
2. **Check PR target** - Must target `main` branch
3. **Wait a moment** - Can take 10-30 seconds to trigger
4. **Check Actions tab** - See if workflow is queued

---

## 🤝 Getting Help

- **Documentation Issues:** Create an issue labeled `documentation`
- **Schema Questions:** Reference schema files in `/schemas/`
- **Content Feedback:** Ask in pull request comments
- **Technical Problems:** Create issue labeled `content-submission`
- **Validation Errors:** Check [CI/CD Maintainer Guide](MAINTAINING_CI.md) or ask in PR

---

## 📜 License

By contributing content, you agree that your submissions will be licensed under the project's MIT License.

---

**Happy Creating!** 🎲✨

Your contributions help Dungeon Masters create amazing adventures. Thank you for being part of the LoreWeaver community!
