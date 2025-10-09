# Example Projects - Demo Data

## 🎉 3 Complete Example Projects Created!

Three fully-configured AHP decision projects have been added to the database with complete data including criteria, alternatives, and pairwise comparisons.

---

## 📊 Project 1: Laptop Selection for University

**Goal:** Select the optimal laptop considering performance, price, portability, and battery life

### Criteria (4)
1. **Performance** - Processing power and speed
2. **Price** - Cost and value for money
3. **Portability** - Weight and size
4. **Battery Life** - Hours of usage per charge

### Alternatives (4)
1. **Dell XPS 13** - Premium ultrabook with great performance
2. **MacBook Air M2** - Apple silicon with excellent battery life
3. **ThinkPad X1 Carbon** - Business-class laptop with durability
4. **HP Pavilion 15** - Budget-friendly option with good specs

### Criteria Priority
- Performance is most important (for CS studies)
- Price comes second (student budget)
- Battery life third (long study sessions)
- Portability fourth (nice to have)

### Comparisons Status
- ✅ 6 criteria comparisons completed
- ✅ 24 alternative comparisons (6 per criterion)
- ✅ Ready for AHP calculation

---

## 🚗 Project 2: Family Car Selection

**Goal:** Select the optimal car considering safety, fuel efficiency, comfort, and price

### Criteria (4)
1. **Safety** - Safety ratings and features
2. **Fuel Efficiency** - Miles per gallon
3. **Comfort** - Interior space and ride quality
4. **Price** - Purchase price and value

### Alternatives (4)
1. **Toyota RAV4** - Reliable and fuel-efficient
2. **Honda CR-V** - Spacious with good safety
3. **Mazda CX-5** - Fun to drive with premium feel
4. **Hyundai Tucson** - Budget-friendly with warranty

### Criteria Priority
- Safety is paramount (family vehicle)
- Fuel efficiency second (long-term savings)
- Comfort third (family trips)
- Price fourth (willing to pay for quality)

### Comparisons Status
- ✅ 6 criteria comparisons completed
- ✅ 24 alternative comparisons (6 per criterion)
- ✅ Ready for AHP calculation

---

## 💼 Project 3: Software Engineer Job Offers

**Goal:** Choose the best job offer considering salary, work-life balance, growth, and location

### Criteria (4)
1. **Salary & Benefits** - Compensation package
2. **Work-Life Balance** - Flexibility and work hours
3. **Career Growth** - Learning and advancement opportunities
4. **Location** - Commute and city quality

### Alternatives (4)
1. **Google - Senior SWE** - Large tech company with great benefits
2. **Startup - Lead Developer** - High growth potential, equity
3. **Microsoft - SWE II** - Stable with good work-life balance
4. **Local Company - Senior Dev** - Close to home, good culture

### Criteria Priority
- Salary and Career Growth equally important
- Work-Life Balance second (avoiding burnout)
- Location fourth (can be flexible)

### Comparisons Status
- ✅ 6 criteria comparisons completed
- ✅ 24 alternative comparisons (6 per criterion)
- ✅ Ready for AHP calculation

---

## 🔐 Access the Projects

### Login Credentials
```
Email: demo@ahp.com
Password: Demo123!
```

### Steps to View
1. Visit http://localhost:3000
2. Click "Login"
3. Enter credentials above
4. You'll see 3 projects on the dashboard
5. Click any project to view details
6. Click "View Results" to see AHP analysis

---

## 📈 What You Can Do

### For Each Project:

1. **View Project Details**
   - See all criteria and alternatives
   - Edit or add more if needed

2. **Review Comparisons**
   - Click "Compare" to see all pairwise comparisons
   - Modify comparison values
   - See consistency ratios

3. **Calculate Results**
   - Click "Calculate Results" button
   - View final rankings
   - See criteria weights
   - Check consistency analysis

4. **Perform Sensitivity Analysis**
   - Adjust criterion weights
   - See how rankings change
   - Test decision robustness

5. **Export Report**
   - Generate PDF report
   - Includes all data and charts
   - Professional formatting

---

## 🎓 Learning Points

### Project 1 (Laptop) - Balanced Decision
- Demonstrates trade-offs between performance and budget
- Shows how battery life impacts student needs
- Good example of tech product evaluation

### Project 2 (Car) - Safety-First Decision
- Emphasizes safety as top priority
- Balances long-term costs (fuel) vs upfront price
- Family-oriented decision making

### Project 3 (Job) - Career Decision
- Multiple competing priorities
- Shows compensation vs quality of life trade-offs
- Real-world career decision scenario

---

## 📊 Database Statistics

```sql
Projects: 3
Criteria: 12 (4 per project)
Alternatives: 12 (4 per project)
Criteria Comparisons: 18 (6 per project)
Alternative Comparisons: 72 (24 per project)
Total Comparisons: 90
```

---

## 🧪 Testing AHP Calculations

### Via API (with authentication):

```bash
# 1. Get auth token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ahp.com","password":"Demo123!"}' \
  | jq -r '.token')

# 2. Get projects
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/projects

# 3. Calculate results for a project (replace PROJECT_ID)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/ahp/calculate/PROJECT_ID

# 4. Get results
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/ahp/results/PROJECT_ID
```

### Via Web Interface:

1. Login at http://localhost:3000
2. Click on any project
3. Click "Calculate Results" or "View Results"
4. See rankings, weights, and consistency ratios

---

## 🔄 Resetting Example Data

If you want to reset and recreate the examples:

```bash
# 1. Copy seed script to container
docker cp ahp-app/backend/seed-examples.js ahp-backend:/app/

# 2. Clear existing data (optional)
docker-compose exec postgres psql -U ahp_user -d ahp_db \
  -c "DELETE FROM projects WHERE title LIKE '%Selection%' OR title LIKE '%Offers%';"

# 3. Run seed script
docker-compose exec backend node seed-examples.js
```

---

## 📝 Notes

- All comparisons use Saaty's 1-9 scale
- Comparison values are designed to be reasonably consistent (CR < 0.1)
- Projects represent realistic decision scenarios
- Data can be modified through the web interface
- Additional projects can be created by users

---

## 🎯 Expected Results

While exact values depend on the AHP calculation engine, here are the expected patterns:

### Laptop Project
- **Expected Winner:** MacBook Air M2 or Dell XPS 13
- **Why:** Good balance of performance, battery, and portability
- **Budget Option:** HP Pavilion will score lower but offer best value

### Car Project
- **Expected Winner:** Honda CR-V or Toyota RAV4
- **Why:** Excellent safety ratings and reliability
- **Budget Option:** Hyundai Tucson competitive on price

### Job Project
- **Expected Winner:** Google or Microsoft
- **Why:** Best compensation and growth opportunities
- **Dark Horse:** Local Company if work-life balance is valued

---

## ✨ What Makes This Complete

✅ **Realistic Scenarios** - Based on actual decision problems
✅ **Complete Data** - All criteria, alternatives, and comparisons filled
✅ **Consistent Comparisons** - Values designed for acceptable CR
✅ **Diverse Examples** - Consumer products, major purchases, career decisions
✅ **Ready to Use** - No additional setup needed
✅ **Educational** - Demonstrates AHP methodology

---

**Created:** October 9, 2025
**Status:** ✅ Live in database
**Access:** http://localhost:3000 (demo@ahp.com / Demo123!)

Enjoy exploring the AHP Decision Support System! 🚀
