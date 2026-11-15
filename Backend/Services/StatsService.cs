using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public static class StatsService
    {
        public static double Median(IEnumerable<double> xs)
        {
            var s = xs.OrderBy(x => x).ToList();
            if (s.Count == 0) return 0;
            return s.Count % 2 == 1 ? s[s.Count / 2] : (s[s.Count / 2 - 1] + s[s.Count / 2]) / 2;
        }
    }
}