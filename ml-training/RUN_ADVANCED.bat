@echo off
cd /d "C:\Users\matab\Documents\bot pari\football-predictor-clean\ml-training"
echo.
echo ============================================================
echo ADVANCED FOOTBALL TRAINING WITH MULTI-LEAGUE DATA
echo ============================================================
echo.
echo Leagues: World Cup, Champions League, Premier League, Ligue 1, LaLiga, Serie A
echo Samples: 150,000+
echo Features: 50+
echo.
python PRODUCTION_TRAINING_ADVANCED.py --gpu
pause
