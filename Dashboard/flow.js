var freqCounter = 1;

// function actFlow (energy) {
//   var linkExtent = d3.extent(energy.links, function (d) {return d.value});
//   var frequencyScale = d3.scale.linear().domain(linkExtent).range([0.05,1]);
//   var particleSize = d3.scale.linear().domain(linkExtent).range([1,5]);
//
//
// }



function flow (energy) {
  var linkExtent = d3.extent(energy.links, function (d) {return d.value});
  var frequencyScale = d3.scale.linear().domain(linkExtent).range([0.05,1]);
  var particleSize = d3.scale.linear().domain(linkExtent).range([1,5]);


  energy.links.forEach(function (link) {
    // if statement
    if(link.activity === true) {
      link.freq = frequencyScale(link.value);
      link.particleSize = 2;
      link.particleColor = d3.scale.linear().domain([0,1])
      .range([link.source.color, link.target.color]);
        }
      })

  var t = d3.timer(tick, 1000);
  var particles = [];

  function tick(elapsed, time) {

    particles = particles.filter(function (d) {return d.current < d.path.getTotalLength()});

    d3.selectAll("path.link")
    .each(
      function (d) {
  //        if (d.freq < 1) {
        for (var x = 0;x<2;x++) {
          var offset = (Math.random() - .5) * (d.dy - 4);
          if (Math.random() < d.freq) {
            var length = this.getTotalLength();
            particles.push({link: d, time: elapsed, offset: offset, path: this, length: length, animateTime: length, speed: 0.5 + (Math.random())})
          }
        }

  //        }
  /*        else {
          for (var x = 0; x<d.freq; x++) {
            var offset = (Math.random() - .5) * d.dy;
            particles.push({link: d, time: elapsed, offset: offset, path: this})
          }
        } */
      });

    particleEdgeCanvasPath(elapsed);
  }

  function particleEdgeCanvasPath(elapsed) {
    var context = d3.select("canvas").node().getContext("2d")

    context.clearRect(0,0,1000,1000);

      context.fillStyle = "black";
      context.lineWidth = "1px";
    for (var x in particles) {
        var currentTime = elapsed - particles[x].time;
  //        var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
        particles[x].current = currentTime * 0.15 * particles[x].speed;
        var currentPos = particles[x].path.getPointAtLength(particles[x].current);
        context.beginPath();
      context.fillStyle = particles[x].link.particleColor(0);
        context.arc(currentPos.x,currentPos.y + particles[x].offset,particles[x].link.particleSize,0,2*Math.PI);
        context.fill();
    }
  }
}



// // VARYING SPEED AND FILL ----
// function flow (energy) {
//   var linkExtent = d3.extent(energy.links, function (d) {return d.value});
// var frequencyScale = d3.scale.linear().domain(linkExtent).range([1,100]);
// var particleSize = d3.scale.linear().domain(linkExtent).range([1,5]);
//
//
// energy.links.forEach(function (link) {
//   link.freq = frequencyScale(link.value);
//   link.particleSize = particleSize(link.value);
//   link.particleColor = d3.scale.linear().domain([1,1000]).range([link.source.color, link.target.color]);
// })
//
// var t = d3.timer(tick, 1000);
// var particles = [];
//
// function tick(elapsed, time) {
//
//   particles = particles.filter(function (d) {return d.time > (elapsed - 1000)});
//
//   if (freqCounter > 100) {
//     freqCounter = 1;
//   }
//
//   d3.selectAll("path.link")
//   .each(
//     function (d) {
//       if (d.freq >= freqCounter) {
//         var offset = (Math.random() - .5) * d.dy;
//         particles.push({link: d, time: elapsed, offset: offset, path: this})
//       }
//     });
//
//   particleEdgeCanvasPath(elapsed);
//   freqCounter++;
//
// }
//
// function particleEdgeCanvasPath(elapsed) {
//   var context = d3.select("canvas").node().getContext("2d")
//
//   context.clearRect(0,0,1000,1000);
//
//     context.fillStyle = "gray";
//     context.lineWidth = "1px";
//   for (var x in particles) {
//       var currentTime = elapsed - particles[x].time;
//       var currentPercent = currentTime / 1000 * particles[x].path.getTotalLength();
//       var currentPos = particles[x].path.getPointAtLength(currentPercent)
//       context.beginPath();
//     context.fillStyle = particles[x].link.particleColor(currentTime);
//       context.arc(currentPos.x,currentPos.y + particles[x].offset,particles[x].link.particleSize,0,2*Math.PI);
//       context.fill();
//   }
// }
// }
// // VARYING SPEED AND FILL --------
